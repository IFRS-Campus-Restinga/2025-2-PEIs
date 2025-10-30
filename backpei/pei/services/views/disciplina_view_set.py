from rest_framework.viewsets import ModelViewSet
from ..serializers.disciplina_serializer import *
from pei.models import *
from ..permissions import BackendTokenPermission
<<<<<<< HEAD
from django.core.exceptions import ValidationError
=======
from logs.models import Log
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d

class DisciplinaViewSet(ModelViewSet):
    queryset = Disciplina.objects.all()
    serializer_class = DisciplinaSerializer
    permission_classes = [BackendTokenPermission]

<<<<<<< HEAD
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            instance.safe_delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ValidationError as e:
            return Response(
                {"erro": e.message},
                status=status.HTTP_400_BAD_REQUEST
            )
  
=======
    def perform_create(self, serializer):
        instance = serializer.save()
        Log.objects.create(
            acao="Criação de Disciplina",
            detalhes=f"Disciplina criada: {instance.nome} (ID: {instance.id})"
        )
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d
