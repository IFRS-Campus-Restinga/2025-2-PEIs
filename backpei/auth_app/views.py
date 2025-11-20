# backpei/auth_app/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status, serializers

from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

from auth_app.services.google_service import GoogleAuthService

User = get_user_model()


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        id_token_str = request.data.get("id_token")
        if not id_token_str:
            return Response({"detail": "id_token é obrigatório"}, status=400)

        # 1) Validar token com Google
        try:
            info = GoogleAuthService.verify_google_token(id_token_str)
        except ValueError as e:
            return Response({"detail": str(e)}, status=400)

        email = info["email"]
        nome_google = info.get("name")
        foto_google = info.get("picture")

        # 2) Buscar CustomUser
        user = User.objects.filter(email=email).first()

        # NUNCA FEZ PRÉ-CADASTRO
        if not user:
            return Response({
                "status": "pending",
                "email": email,
                "name": nome_google,
                "picture": foto_google,
            })

        # PRÉ-CADASTRO FEITO, MAS NÃO APROVADO
        if not user.aprovado:
            return Response({
                "status": "not_approved",
                "message": "Seu cadastro ainda não foi aprovado."
            }, status=403)

        # APROVADO MAS SEM GRUPO
        if user.groups.count() == 0:
            return Response({
                "status": "no_group",
                "message": "Usuário aprovado, mas sem grupo atribuído."
            }, status=403)

        # 3) Gerar token DRF
        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            "status": "ok",
            "token": token.key,
            "email": user.email,
        })


# --------------------------------------------------------
# PRÉ-CADASTRO
# --------------------------------------------------------
class PreCadastroSerializer(serializers.Serializer):
    email = serializers.EmailField()
    nome = serializers.CharField(max_length=100)
    categoria = serializers.CharField(max_length=30)


class PreCadastroView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        s = PreCadastroSerializer(data=request.data)
        if not s.is_valid():
            return Response(s.errors, status=400)

        email = s.validated_data["email"]
        nome = s.validated_data["nome"]
        categoria = s.validated_data["categoria"]

        # Já existe registro?
        if User.objects.filter(email=email).exists():
            return Response({"detail": "Já existe solicitação para este email."}, status=400)

        # Criar CustomUser sem senha, não aprovado
        user = User.objects.create(
            username=email,
            email=email,
            first_name=nome,
            categoria_solicitada=categoria,
            aprovado=False,
        )
        user.set_unusable_password()
        user.save()

        return Response({
            "status": "created",
            "message": "Solicitação enviada. Aguarde aprovação."
        }, status=201)
