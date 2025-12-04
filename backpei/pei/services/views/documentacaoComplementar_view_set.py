from rest_framework.viewsets import ModelViewSet
from ..serializers import DocumentacaoComplementarSerializer
from pei.models.documentacaoComplementar import DocumentacaoComplementar
from ..permissions import BackendTokenPermission
from django.core.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework import status
from pei.models.aluno import Aluno
from rest_framework.exceptions import ValidationError

class DocumentacaoComplementarViewSet(ModelViewSet):
    serializer_class = DocumentacaoComplementarSerializer
    permission_classes = [BackendTokenPermission]

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
        try:
            instance.safe_delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ValidationError as e:
            return Response(
                {"erro": e.message},
                status=status.HTTP_400_BAD_REQUEST
            )