from rest_framework.viewsets import ModelViewSet
from ..serializers import *
from pei.models import *
from ..permissions import BackendTokenPermission

class DadosViewSet(ModelViewSet):
    queryset = Pessoa.objects.all()
    serializer_class = DadosSerializer
    permission_classes = [BackendTokenPermission]