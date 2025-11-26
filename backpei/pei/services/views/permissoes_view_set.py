from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model

User = get_user_model()

class UsuarioPermissoesView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        user_id = request.query_params.get("id")
        if not user_id:
            return Response({"erro": "ID do usuário não informado."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            usuario = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"erro": "Usuário não encontrado."}, status=status.HTTP_404_NOT_FOUND)

        grupos = list(usuario.groups.values_list("name", flat=True))
        permissoes = list(usuario.get_all_permissions())

        return Response({
            "permissoes": permissoes,
            "grupos": grupos
        }, status=status.HTTP_200_OK)