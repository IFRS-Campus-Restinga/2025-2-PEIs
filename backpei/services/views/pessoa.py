from rest_framework.viewsets import ModelViewSet
from ..serializers.pessoa import PessoaSerializer
from pei.models import Pessoa
from ..permissions import BackendTokenPermission

class PessoaViewSet(ModelViewSet):
    queryset = Pessoa.objects.all()
    serializer_class = PessoaSerializer
    permission_classes = [BackendTokenPermission]