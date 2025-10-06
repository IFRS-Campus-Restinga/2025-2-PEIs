from rest_framework.viewsets import ModelViewSet
from ..serializers.pei_periodo_letivo_serializer import PEIPeriodoLetivoSerializer
from pei.models.pei_periodo_letivo import PEIPeriodoLetivo
from ..permissions import BackendTokenPermission

class PEIPeriodoLetivoViewSet(ModelViewSet):
    queryset = PEIPeriodoLetivo.objects.all()
    serializer_class = PEIPeriodoLetivoSerializer
    permission_classes = [BackendTokenPermission]