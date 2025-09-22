from rest_framework.viewsets import ModelViewSet
from ..serializers.disciplina_serializer import *
from pei.models import *
from ..permissions import BackendTokenPermission

class DisciplinaViewSet(ModelViewSet):
    queryset = Disciplina.objects.all()
    serializer_class = DisciplinaSerializer
    permission_classes = [BackendTokenPermission]