from rest_framework.viewsets import ModelViewSet
from ..serializers.parecer_serializer import *
from pei.models.parecer import *
from ..permissions import BackendTokenPermission

class ParecerViewSet(ModelViewSet):
    queryset = Parecer.objects.all()
    serializer_class = ParecerSerializer
    permission_classes = [BackendTokenPermission]