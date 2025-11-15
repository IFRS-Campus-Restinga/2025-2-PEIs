from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from django.contrib.auth.models import Group

class UsuarioPermissoesView(APIView):
    authentication_classes = []  
    permission_classes = [AllowAny]

    def get(self, request):
        tipo = request.query_params.get("tipo")
        user_id = request.query_params.get("id")

        if not tipo:
            return Response({"erro": "Tipo não informado."}, status=status.HTTP_400_BAD_REQUEST)

        tipo_normalizado = tipo.strip().replace("_", " ").title()

        print(f"Buscando permissões para grupo: {tipo_normalizado} (id={user_id})")

        try:
            grupo = Group.objects.get(name__iexact=tipo_normalizado)
        except Group.DoesNotExist:
            return Response(
                {"erro": f"Grupo '{tipo_normalizado}' não encontrado."},
                status=status.HTTP_404_NOT_FOUND
            )

        permissoes = [p.codename for p in grupo.permissions.all()]

        print(f"Permissões encontradas: {permissoes}")

        return Response({"permissoes": permissoes}, status=status.HTTP_200_OK)
