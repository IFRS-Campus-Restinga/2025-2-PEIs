from rest_framework.viewsets import ModelViewSet
from ..serializers.professor_seralizer import *
from pei.models.professor import *
from ..permissions import BackendTokenPermission

class ProfessorViewSet(ModelViewSet):
    queryset = Professor.objects.all()
    serializer_class = ProfessorSerializer
    permission_classes = [BackendTokenPermission]