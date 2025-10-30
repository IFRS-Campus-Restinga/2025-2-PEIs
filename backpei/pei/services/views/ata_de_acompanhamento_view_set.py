from rest_framework.viewsets import ModelViewSet
from ..serializers import AtaDeAcompanhamentoSerializer
from pei.models import AtaDeAcompanhamento
from ..permissions import BackendTokenPermission

class AtaDeAcompanhamentoViewSet(ModelViewSet):
    queryset = AtaDeAcompanhamento.objects.all()
    serializer_class = AtaDeAcompanhamentoSerializer
    permission_classes = [BackendTokenPermission]