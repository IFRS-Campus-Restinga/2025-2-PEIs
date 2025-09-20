from rest_framework.viewsets import ModelViewSet
from ..serializers.aluno_serializer import *
from pei.models.aluno import *
from ..permissions import BackendTokenPermission

class AlunoViewSet(ModelViewSet):
    queryset = Aluno.objects.all()
    serializer_class = AlunoSerializer
    permission_classes = [BackendTokenPermission]