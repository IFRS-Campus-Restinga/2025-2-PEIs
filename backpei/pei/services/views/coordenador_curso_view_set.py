from rest_framework.viewsets import ModelViewSet
from ..serializers.coordenador_curso_serializer import *
from pei.models.coordenador_curso import *
from ..permissions import BackendTokenPermission

class CoordenadorCursoViewSet(ModelViewSet):
    queryset = CoordenadorCurso.objects.all()
    serializer_class = CoordenadorCursoSerializer
    permission_classes = [BackendTokenPermission]