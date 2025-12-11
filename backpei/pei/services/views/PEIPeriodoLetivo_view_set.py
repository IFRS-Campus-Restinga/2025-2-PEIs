from rest_framework.viewsets import ModelViewSet
from ..serializers.PEIPeriodoLetivo_serializer import PEIPeriodoLetivoSerializer
from pei.models.PEIPeriodoLetivo import PEIPeriodoLetivo
from ..permissions import BackendTokenPermission
from django.core.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework import status

from rest_framework.decorators import action
from rest_framework.permissions import DjangoObjectPermissions

from pei.services.serializers.parecer_serializer import ParecerSerializer  # IMPORTANTE


class PEIPeriodoLetivoViewSet(ModelViewSet):
    serializer_class = PEIPeriodoLetivoSerializer
    permission_classes = [DjangoObjectPermissions]

    queryset = PEIPeriodoLetivo.objects.prefetch_related(
        'componentes_curriculares__disciplinas__cursos__coordenador',
        'componentes_curriculares__pareceres__professor',
        'pei_central__aluno'
    ).all()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            instance.safe_delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ValidationError as e:
            return Response({"erro": e.message}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], url_path='pareceres')
    def get_pareceres(self, request, pk=None):
        # Carregar o período letivo específico
        periodo = self.get_object()

        # Coletar TODOS os pareceres dos componentes curriculares do período
        pareceres = [
            parecer
            for componente in periodo.componentes_curriculares.all()
            for parecer in componente.pareceres.all()
        ]

        # Serializar tudo
        serializer = ParecerSerializer(pareceres, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


    @action(detail=False, methods=['get'], url_path='alunos')
    def get_alunos(self, request):
        """
        Retorna uma lista dos nomes dos alunos vinculados aos PEIs centrais
        de todos os períodos letivos.
        """
        alunos = set()
        for periodo in self.get_queryset():
            if periodo.pei_central and periodo.pei_central.aluno:
                alunos.add(periodo.pei_central.aluno.nome)
        return Response({"alunos": list(alunos)}, status=status.HTTP_200_OK)
    
