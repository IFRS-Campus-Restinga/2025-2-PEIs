from rest_framework.viewsets import ModelViewSet
from ..serializers.disciplina_serializer import DisciplinaSerializer
from pei.models.disciplina import Disciplina
from ..permissions import BackendTokenPermission
from django.core.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework import status

class DisciplinaViewSet(ModelViewSet):
    queryset = Disciplina.objects.prefetch_related('professores', 'cursos').all()    
    serializer_class = DisciplinaSerializer
    permission_classes = [BackendTokenPermission]

    def create(self, request, *args, **kwargs):
        professores_ids = request.data.pop('professores', [])
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        disciplina = serializer.save()
        
        if professores_ids:
            disciplina.professores.set(professores_ids)
        
        return Response(self.get_serializer(disciplina).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        professores_ids = request.data.pop('professores', None)
        
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        disciplina = serializer.save()
        
        if professores_ids is not None:
            disciplina.professores.set(professores_ids)
        
        return Response(self.get_serializer(disciplina).data, status=status.HTTP_200_OK)

    # DELETE
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
