from rest_framework.viewsets import ModelViewSet
from ..serializers.componente_curricular_serializer import ComponenteCurricularSerializer
from pei.models import ComponenteCurricular
from ..permissions import BackendTokenPermission

class ComponenteCurricularViewSet(ModelViewSet):
    queryset = ComponenteCurricular.objects.all()
    serializer_class = ComponenteCurricularSerializer
    permission_classes = [BackendTokenPermission]