from rest_framework.viewsets import ModelViewSet
from ..serializers.pedagogo_serializer import PedagogoSerializer
from pei.models import *
from ..permissions import BackendTokenPermission

class PedagogoViewSet(ModelViewSet):
    queryset = Pedagogo.objects.all()
    serializer_class = PedagogoSerializer
    permission_classes = [BackendTokenPermission]