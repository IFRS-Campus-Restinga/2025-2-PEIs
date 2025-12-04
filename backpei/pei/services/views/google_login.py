from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token
from usuarios.models import Usuario
from rest_framework.permissions import DjangoObjectPermissions

class GoogleLoginView(APIView):
    permission_classes = [AllowAny, DjangoObjectPermissions]

    def post(self, request):
        email = request.data.get("email")
        name = request.data.get("name")
        picture = request.data.get("picture")

        User = get_user_model()
        user = User.objects.filter(email=email).first()

        # 1. Se não existe User => redireciona para pré-cadastro
        if not user:
            return Response({
                "status": "pending",
                "message": "Usuário não encontrado. Redirecionar para pré-cadastro.",
                "email": email,
                "name": name,
                "picture": picture
            }, status=200)

        # 2. Se existe User, verifica se existe Usuario (modelo interno)
        usuario = Usuario.objects.filter(user=user).first()

        if not usuario:
            return Response({
                "status": "pending",
                "message": "Usuário sem cadastro interno. Redirecionar para pré-cadastro.",
                "email": email,
                "name": name,
                "picture": picture
            }, status=200)

        # 3. Verifica aprovação
        # Supondo que tu tenha um campo 'aprovado' no modelo
        if not usuario.aprovado:
            return Response({
                "status": "not_approved",
                "message": "Cadastro aguardando aprovação."
            }, status=401)

        # 4. Verifica grupos
        if usuario.grupos.count() == 0:
            return Response({
                "status": "no_group",
                "message": "Usuário sem grupo definido."
            }, status=401)

        # 5. Tudo OK → Logar
        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            "status": "ok",
            "token": token.key
        })
