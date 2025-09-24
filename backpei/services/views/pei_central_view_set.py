from rest_framework.viewsets import ModelViewSet
from ..serializers import *
from pei.models import *
from ..permissions import BackendTokenPermission

class PeiCentralViewSet(ModelViewSet):
    queryset = PeiCentral.objects.all()
    serializer_class = PeiCentralSerializer
    permission_classes = [BackendTokenPermission]