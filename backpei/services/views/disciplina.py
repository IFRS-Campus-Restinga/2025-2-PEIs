from rest_framework.viewsets import ModelViewSet
from ..serializers import DisciplinaSerializer
from pei.models import Disciplina
from ..permissions import BackendTokenPermission

class DisciplinaViewSet(ModelViewSet):
    queryset = Disciplina.objects.all()
    serializer_class = DisciplinaSerializer
    permission_classes = [BackendTokenPermission]