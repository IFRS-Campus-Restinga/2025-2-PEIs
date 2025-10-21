from rest_framework.viewsets import ModelViewSet
from ..serializers import *
from pei.models import *
from ..permissions import BackendTokenPermission

class PeiCentralViewSet(ModelViewSet):
    queryset = PeiCentral.objects.all()
    serializer_class = PeiCentralSerializer
    permission_classes = [BackendTokenPermission]
    
    def update(self, request, *args, **kwargs):
        print(">>> RECEBIDO PELO FRONT:", request.data)
        return super().update(request, *args, **kwargs)