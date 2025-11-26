from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.http import FileResponse
from ..serializers.curso_serializer import CursoSerializer
from pei.models.curso import Curso
from ..permissions import BackendTokenPermission
from django.core.exceptions import ValidationError

class CursoViewSet(ModelViewSet):
    queryset = Curso.objects.all().order_by('nome')
    serializer_class = CursoSerializer
    #permission_classes = [BackendTokenPermission]

    # Create padrão (DRF já trata o arquivo automaticamente)
    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        if 'arquivo_upload' in request.FILES:
            data['arquivo'] = request.FILES['arquivo_upload']  # mapeia para o campo do model

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        data = request.data.copy()
        if 'arquivo_upload' in request.FILES:
            data['arquivo'] = request.FILES['arquivo_upload']

        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

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


    # Endpoint de download de arquivo
    @action(detail=True, methods=['get'], url_path='download')
    def download(self, request, pk=None):
        curso = self.get_object()
        if not curso.arquivo:
            return Response({"error": "Arquivo não encontrado"}, status=status.HTTP_404_NOT_FOUND)
        
        filename = curso.arquivo.name.split('/')[-1]
        return FileResponse(curso.arquivo, as_attachment=True, filename=filename)