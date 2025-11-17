from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from pei.models.usuario import Usuario
from pei.services.serializers.usuario_serializer import UsuarioSerializer


class UsuarioViewSet(viewsets.ModelViewSet):
    """
    ViewSet para listar, visualizar, editar e excluir usuários.
    NÃO cria usuário — isso é feito somente após a aprovação da RegistrationRequest.
    """

    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        """
        Sobrescrevendo apenas para deixar o retorno mais amigável se necessário.
        """
        usuarios = Usuario.objects.all()
        serializer = UsuarioSerializer(usuarios, many=True)
        return Response(serializer.data)
