from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework import status
from ..permissions import BackendTokenPermission
from pei.models.CustomUser import CustomUser

class ConsultaGrupos(APIView):
    # nosso mecanismo de injetar token do administrador
    permission_classes = [BackendTokenPermission]
    def get(self, request):
        # recebe e valida email do usuario pelo cabecalho
        user_email = request.headers.get("X-User-Email")
        if not user_email:
            return Response(
                {"erro": "Cabeçalho X-User-Email não enviado"},
                status=status.HTTP_400_BAD_REQUEST )
        # realiza a busca na base de usuarios
        try:
            usuario = CustomUser.objects.get(email=user_email)
        except CustomUser.DoesNotExist:
        # linha para usuarios comuns de django
        #    usuario = User.objects.get(email=user_email)
        #except User.DoesNotExist:
            return Response(
                {"erro": "Usuário não encontrado"},
                status=status.HTTP_404_NOT_FOUND )
        # encontramos o usuario e agora pegaremos os grupos dele
        grupos = list(usuario.groups.values_list("name", flat=True))
        # volta a informacao
        return Response({
            "email": user_email,
            "grupos": grupos })
