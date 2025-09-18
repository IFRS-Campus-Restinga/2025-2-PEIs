from rest_framework.viewsets import ModelViewSet
from ..serializers import CursoSerializer
from pei.models import Curso
from ..permissions import BackendTokenPermission

class CursoViewSet(ModelViewSet):
    queryset = Curso.objects.all()
    serializer_class = CursoSerializer
    permission_classes = [BackendTokenPermission]