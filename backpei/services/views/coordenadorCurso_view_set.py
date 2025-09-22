from rest_framework.viewsets import ModelViewSet
from ..serializers.coordenadorCurso_serializer import *
from pei.models.coordenadorCurso import *
from ..permissions import BackendTokenPermission

class CoordenadorCursoViewSet(ModelViewSet):
    queryset = CoordenadorCurso.objects.all()
    serializer_class = CoordenadorCursoSerializer
    permission_classes = [BackendTokenPermission]