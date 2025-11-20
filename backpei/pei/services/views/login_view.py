# pei/services/views/login_view.py
from django.contrib.auth import authenticate, get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token

from pei.services.serializers.usuario_serializer import UsuarioSerializer
from pei.models.usuario import Usuario

User = get_user_model()

class LoginView(APIView):
    """
    POST /api/login/
    Body: { "email": "...", "senha": "..." }
    Resposta: { token, usuario, status }
    """

    permission_classes = []  # permitir acesso sem autenticação

    def post(self, request):
        email = request.data.get("email")
        senha = request.data.get("senha")

        if not email or not senha:
            return Response({"error": "Email e senha são obrigatórios."},
                            status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=email, password=senha)
        if user is None:
            return Response({"error": "Credenciais inválidas."}, status=status.HTTP_401_UNAUTHORIZED)

        # tenta achar perfil Usuario relacionado
        perfil = Usuario.objects.filter(email=user.email).first()

        usuario_status = "aprovado" if getattr(user, "is_active", True) else "pendente"
        if perfil:
            usuario_status = perfil.status.lower() if perfil.status else usuario_status

        if usuario_status != "aprovado" and usuario_status != "APROVED" and usuario_status != "APPROVED":
            return Response({"error": "Cadastro pendente. Aguarde aprovação.", "status": usuario_status},
                            status=status.HTTP_403_FORBIDDEN)

        # gerar token DRF (mantemos compatibilidade com fluxo google)
        token_obj, _ = Token.objects.get_or_create(user=user)
        token = token_obj.key

        usuario_serializado = {}
        if perfil:
            usuario_serializado = UsuarioSerializer(perfil).data
        else:
            # fallback básico com informações do User
            usuario_serializado = {
                "email": user.email,
                "nome": user.first_name or "",
                # sem categoria
            }

        return Response({
            "token": token,
            "usuario": usuario_serializado,
            "status": "aprovado"
        }, status=status.HTTP_200_OK)
