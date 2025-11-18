# pei/services/views/login_view.py
from django.contrib.auth import authenticate, get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token

from pei.services.serializers.usuario_serializer import UsuarioSerializer

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

        # Tentar autenticar (assume que authenticate aceita email como username, ajuste se necessário)
        user = authenticate(request, username=email, password=senha)
        if user is None:
            return Response({"error": "Credenciais inválidas."}, status=status.HTTP_401_UNAUTHORIZED)

        # Se usuário existe, verificar se está ativo/aprovado
        # Supondo que usuário aprovado tem is_active=True ou campo status igual "APPROVED"
        usuario_status = "aprovado" if getattr(user, "is_active", True) else "pendente"

        if usuario_status != "aprovado":
            # não retornar token para usuários não aprovados
            return Response({"error": "Cadastro pendente. Aguarde aprovação.", "status": usuario_status},
                            status=status.HTTP_403_FORBIDDEN)

        # Gerar/recuperar token DRF
        token_obj, _ = Token.objects.get_or_create(user=user)
        token = token_obj.key

        serializer = UsuarioSerializer(user)
        return Response({
            "token": token,
            "usuario": serializer.data,
            "status": usuario_status
        }, status=status.HTTP_200_OK)
