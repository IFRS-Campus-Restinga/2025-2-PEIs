from rest_framework.viewsets import ModelViewSet
from ..serializers.curso_serializer import *
from pei.models import *
from ..permissions import BackendTokenPermission

class CursoViewSet(ModelViewSet):
    queryset = Curso.objects.select_related('coordenador').prefetch_related('disciplinas')
    serializer_class = CursoSerializer
    permission_classes = [BackendTokenPermission]
