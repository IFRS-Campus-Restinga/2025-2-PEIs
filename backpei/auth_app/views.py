# backpei/auth_app/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework import generics
from rest_framework import serializers

from auth_app.services.google_service import GoogleAuthService
from pei.models.usuario import Usuario 

UserModel = get_user_model()

class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        id_token_str = request.data.get("id_token")
        if not id_token_str:
            return Response({"detail": "id_token é obrigatório"}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Validar token com o Google
        try:
            info = GoogleAuthService.verify_google_token(id_token_str)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        email = info["email"]
        name = info.get("name")
        picture = info.get("picture")

        # 2. Buscar solicitação interna (Usuario)
        usuario = Usuario.objects.filter(email=email).first()

        # → Caso nunca tenha feito pré-cadastro:
        if not usuario:
            return Response({
                "status": "pending",
                "message": "Usuário não encontrado. Complete seu pré-cadastro.",
                "email": email,
                "name": name,
                "picture": picture
            }, status=200)

        # → Caso já tenha pré-cadastro, mas ainda não aprovado:
        if not usuario.aprovado:
            return Response({
                "status": "not_approved",
                "message": "Seu cadastro está aguardando aprovação do administrador."
            }, status=403)

        # → Após aprovado, deve existir Django User:
        user = usuario.user
        if not user:
            # Estado que só deve aparecer se admin não aprovou corretamente,
            # ou se houve erro na criação do Django User.
            return Response({
                "status": "not_approved",
                "message": "Seu cadastro foi aprovado, mas ainda não está ativo. Contate o administrador."
            }, status=403)

        # → Verificar se tem grupo (papel)
        if user.groups.count() == 0:
            return Response({
                "status": "no_group",
                "message": "Seu cadastro foi aprovado, mas ainda não possui um grupo definido. Contate o administrador."
            }, status=403)

        # → Tudo certo: gerar token DRF
        from rest_framework.authtoken.models import Token
        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            "status": "ok",
            "token": token.key,
            "email": user.email
        }, status=200)


class PreCadastroSerializer(serializers.Serializer):
    email = serializers.EmailField()
    nome = serializers.CharField(max_length=100)
    categoria = serializers.CharField(max_length=50)


class PreCadastroView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PreCadastroSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        email = serializer.validated_data["email"]
        nome = serializer.validated_data["nome"]
        categoria = serializer.validated_data["categoria"]

        # Verifica se já existe solicitação
        usuario = Usuario.objects.filter(email=email).first()

        if usuario:
            return Response(
                {"detail": "Já existe uma solicitação para este email."},
                status=400
            )

        # Cria solicitação nova
        Usuario.objects.create(
            email=email,
            nome=nome,
            categoria_solicitada=categoria,
            aprovado=False
        )

        return Response({
            "status": "created",
            "message": "Solicitação enviada com sucesso. Aguarde a aprovação do administrador."
        }, status=201)
