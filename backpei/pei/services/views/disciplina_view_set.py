from rest_framework.viewsets import ModelViewSet
from ..serializers.disciplina_serializer import *
from pei.models import *
from ..permissions import BackendTokenPermission
from logs.models import Log

class DisciplinaViewSet(ModelViewSet):
    queryset = Disciplina.objects.all()
    serializer_class = DisciplinaSerializer
    permission_classes = [BackendTokenPermission]

    def perform_create(self, serializer):
        instance = serializer.save()
        Log.objects.create(
            acao="Criação de Disciplina",
            detalhes=f"Disciplina criada: {instance.nome} (ID: {instance.id})"
        )