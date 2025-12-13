from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group  # Importante para buscar o grupo

from auth_app.services.google_service import GoogleAuthService
# IMPORTAÇÃO DA FUNÇÃO DE NOTIFICAÇÃO
from pei.utils.notificacoes_utils import criar_notificacao

User = get_user_model()


# =============================================================================
# LOGIN GOOGLE
# =============================================================================

class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):

        print(">>> GATILHO DE LOGIN ACIONADO! <<<")
        try:
            from pei.utils.notificacoes_utils import verificar_periodos_e_gerar_notificacoes
            verificar_periodos_e_gerar_notificacoes()
        except Exception as e:
            print(f"ERRO NO GATILHO: {e}")
            
        id_token_str = request.data.get("id_token")
        if not id_token_str:
            return Response({"detail": "id_token é obrigatório"}, status=400)

        try:
            info = GoogleAuthService.verify_google_token(id_token_str)
        except ValueError as e:
            return Response({"detail": str(e)}, status=400)

        email = info["email"]
        name = info.get("name")
        picture = info.get("picture")

        user = User.objects.filter(email=email).first()

        if not user:
            return Response({
                "status": "pending",
                "email": email,
                "name": name,
                "picture": picture
            })

        if not user.aprovado:
            return Response({"status": "not_approved"}, status=403)

        if user.groups.count() == 0:
            return Response({"status": "no_group"}, status=403)

        from rest_framework.authtoken.models import Token
        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            "status": "ok",
            "token": token.key,
            "email": user.email
        })


# =============================================================================
# PRÉ-CADASTRO
# =============================================================================

class PreCadastroSerializer(serializers.Serializer):
    name = serializers.CharField(required=False, allow_blank=True)
    nome = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField()
    picture = serializers.URLField(required=False, allow_blank=True)
    categoria = serializers.CharField(required=False)
    categoria_solicitada = serializers.CharField(required=False)

    def validate(self, data):
        data["name"] = data.get("name") or data.get("nome")
        if not data["name"]:
            raise serializers.ValidationError("Nome é obrigatório.")

        data["categoria_solicitada"] = (
            data.get("categoria_solicitada")
            or data.get("categoria")
        )

        if not data["categoria_solicitada"]:
            raise serializers.ValidationError("Categoria é obrigatória.")

        return data


class PreCadastroView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):

        serializer = PreCadastroSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        email = data["email"]

        if User.objects.filter(email=email).exists():
            return Response({"detail": "Usuário já cadastrado"}, status=400)
        
        # Tenta separar nome e sobrenome
        nome_completo = data["name"].strip().split(" ", 1)
        first_name = nome_completo[0]
        last_name = nome_completo[1] if len(nome_completo) > 1 else ""

        # Cria usuário pendente
        user = User.objects.create(
            username=email,
            email=email,
            first_name=first_name,
            last_name=last_name,
            foto=data.get("picture") or "",
            categoria_solicitada=data["categoria_solicitada"],
            aprovado=False
        )
        user.set_unusable_password()
        user.save()

        # logica para notificar admins de novos usuarios
        try:
            admins = User.objects.filter(groups__name='Admin')
            titulo = "Nova Solicitação de Cadastro"
            mensagem = f"O usuário {data['name']} ({email}) solicitou acesso como {data['categoria_solicitada']}."

            print(f"🔔 Notificando {admins.count()} administradores.")

            for admin in admins:
                criar_notificacao(
                    usuario=admin, 
                    titulo=titulo, 
                    mensagem=mensagem, 
                    enviar_email=True,
                    tipo='solicitacao_cadastro',  # Tipo específico
                    dados_extras={
                        'candidato_id': user.id,  # ID do usuário novo (para aprovar/rejeitar)
                        'candidato_nome': user.first_name,
                        'url': '/admin/solicitacoes'
                    }
                )

        except Exception as e:
            print(f"❌ Erro ao notificar admins: {e}")
        
        return Response({"status": "ok", "message": "Pré-cadastro enviado"})