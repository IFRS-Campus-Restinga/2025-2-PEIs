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
        print(f"DEBUG: Disciplina {instance.nome} criada com sucesso!")  # Debug
        Log.objects.create(
            acao="Criação",
            modelo="Disciplina",
            objeto_id=instance.id,
            detalhes_completos={"nome": instance.nome},  # Use JSONField para armazenar detalhes
            usuario="Sistema"  # Ou obtenha o usuário autenticado, se aplicável
        )