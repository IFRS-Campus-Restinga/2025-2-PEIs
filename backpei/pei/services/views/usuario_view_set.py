from rest_framework.viewsets import ModelViewSet
from ..serializers import UsuarioSerializer
from pei.models import Usuario
from ..permissions import BackendTokenPermission

class UsuarioViewSet(ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [BackendTokenPermission]