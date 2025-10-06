from rest_framework.viewsets import ModelViewSet
from ..serializers.PEIPeriodoLetivo_serializer import PEIPeriodoLetivoSerializer
from pei.models.PEIPeriodoLetivo import PEIPeriodoLetivo
from ..permissions import BackendTokenPermission

class PEIPeriodoLetivoViewSet(ModelViewSet):
    queryset = PEIPeriodoLetivo.objects.all()
    serializer_class = PEIPeriodoLetivoSerializer
    permission_classes = [BackendTokenPermission]