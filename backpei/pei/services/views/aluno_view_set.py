from rest_framework.viewsets import ModelViewSet
from ..serializers.aluno_serializer import *
from pei.models.aluno import *
from ..permissions import BackendTokenPermission
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError
from rest_framework import filters  # Manter o SearchFilter
from rest_framework.permissions import DjangoObjectPermissions



class AlunoViewSet(ModelViewSet):
    serializer_class = AlunoSerializer
    permission_classes = [BackendTokenPermission, DjangoObjectPermissions]

    # --- ATIVAÇÃO DO FILTRO DE BUSCA POR TEXTO ---
    filter_backends = [filters.SearchFilter]
    search_fields = ['nome', 'matricula']
    # ---------------------------------------------
    
    #filtragem aluno
    def get_queryset(self):  
        queryset = Aluno.objects.all()
        curso_id = self.request.query_params.get('curso_id')
        
        if curso_id:
            queryset = queryset.filter(curso_id=curso_id).order_by("nome")
        return queryset
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())[:3]

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
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