from django.contrib.auth import authenticate, get_user_model
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token

from pei.services.serializers.usuario_serializer import UsuarioSerializer
from pei.models.usuario import Usuario

User = get_user_model()


@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    permission_classes = []

    def post(self, request):
        email = request.data.get("email")
        senha = request.data.get("senha")

        if not email or not senha:
            return Response({"error": "Email e senha são obrigatórios."}, status=400)

        # Autentica usando o email como username
        user = authenticate(request, username=email, password=senha)
        if not user:
            return Response({"error": "Credenciais inválidas."}, status=401)

        if not user.is_active:
            return Response({"error": "Usuário inativo."}, status=403)

        # Busca o perfil correto (agora com o vínculo certo)
        perfil = None
        try:
            perfil = user.perfil_usuario  # relação reversa correta
        except Usuario.DoesNotExist:
            perfil = Usuario.objects.filter(email__iexact=email).first()

        # Verifica status do perfil
        if perfil and perfil.status:
            status_perfil = perfil.status.strip().upper()
        else:
            status_perfil = "APPROVED"  # fallback se não tiver perfil

        if status_perfil not in ["APPROVED", "APROVADO"]:
            return Response({
                "error": "Cadastro pendente. Aguarde aprovação.",
                "status": status_perfil
            }, status=403)

        # GERA O TOKEN PARA O USUÁRIO CORRETO
        token, created = Token.objects.get_or_create(user=user)

        # Serializa o perfil
        if perfil:
            usuario_data = UsuarioSerializer(perfil).data
        else:
            usuario_data = {
                "email": user.email,
                "nome": user.get_full_name() or user.username,
                "categoria": "SEM_PERFIL"
            }

        return Response({
            "success": True,
            "token": token.key,
            "usuario": usuario_data,
            "status": "APPROVED"
        }, status=200)