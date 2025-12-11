from rest_framework.viewsets import ModelViewSet
from ..serializers import DocumentacaoComplementarSerializer
from pei.models.documentacaoComplementar import DocumentacaoComplementar
from django.core.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework import status
from pei.models.aluno import Aluno
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import DjangoObjectPermissions

class DocumentacaoComplementarViewSet(ModelViewSet):
    serializer_class = DocumentacaoComplementarSerializer
    permission_classes = [DjangoObjectPermissions]

    def get_queryset(self):
        queryset = DocumentacaoComplementar.objects.all().order_by('id')
        matricula = self.request.query_params.get("matricula")
        if matricula:
            queryset = queryset.filter(aluno__matricula = matricula)

        return queryset

    def perform_create(self, serializer):
        matricula = self.request.data.get("matricula")

        print("MATRICULA RECEBIDA:", matricula)

        if not matricula:
            raise ValidationError({"matricula": "Matrícula não enviada."})

        try:
            aluno = Aluno.objects.get(matricula=matricula)
        except Aluno.DoesNotExist:
            raise ValidationError({"matricula": "Aluno não encontrado com essa matrícula."})

        serializer.save(
            aluno=aluno    
        )        

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        instance.delete()  # Isso chamará o método delete do modelo, que lida com a exclusão do arquivo.

        return Response(status=status.HTTP_204_NO_CONTENT)