from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import serializers
from django.contrib.auth import get_user_model

from auth_app.services.google_service import GoogleAuthService

User = get_user_model()


# =============================================================================
# LOGIN GOOGLE
# =============================================================================

class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        id_token_str = request.data.get("id_token")
        if not id_token_str:
            return Response({"detail": "id_token é obrigatório"}, status=400)

        # valida com o Google
        try:
            info = GoogleAuthService.verify_google_token(id_token_str)
        except ValueError as e:
            return Response({"detail": str(e)}, status=400)

        email = info["email"]
        name = info.get("name")
        picture = info.get("picture")

        # CustomUser é o user REAL
        user = User.objects.filter(email=email).first()

        # Se não existe -> tela de pré-cadastro
        if not user:
            return Response({
                "status": "pending",
                "email": email,
                "name": name,
                "picture": picture
            })

        # Existe mas não aprovado
        if not user.aprovado:
            return Response({"status": "not_approved"}, status=403)

        # Existe mas não tem grupo
        if user.groups.count() == 0:
            return Response({"status": "no_group"}, status=403)

        # Gerar token
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
    # aceita tanto name quanto nome
    name = serializers.CharField(required=False, allow_blank=True)
    nome = serializers.CharField(required=False, allow_blank=True)

    email = serializers.EmailField()
    picture = serializers.URLField(required=False, allow_blank=True)

    # aceita tanto categoria quanto categoria_solicitada
    categoria = serializers.CharField(required=False)
    categoria_solicitada = serializers.CharField(required=False)

    def validate(self, data):
        """
        Harmoniza os campos recebidos.
        Garante que sempre teremos name e categoria_solicitada.
        """
        # NAME
        data["name"] = data.get("name") or data.get("nome")
        if not data["name"]:
            raise serializers.ValidationError("Nome é obrigatório.")

        # CATEGORIA
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

        # já existe?
        if User.objects.filter(email=email).exists():
            return Response({"detail": "Usuário já cadastrado"}, status=400)

        # criar usuário pendente
        user = User.objects.create(
            username=email,
            email=email,
            first_name=data["name"],
            foto=data.get("picture") or "",
            categoria_solicitada=data["categoria_solicitada"],
            aprovado=False
        )
        user.set_unusable_password()
        user.save()

        return Response({"status": "ok", "message": "Pré-cadastro enviado"})
