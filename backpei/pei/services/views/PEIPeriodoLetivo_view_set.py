from rest_framework.viewsets import ModelViewSet
from ..serializers.PEIPeriodoLetivo_serializer import PEIPeriodoLetivoSerializer
from pei.models.PEIPeriodoLetivo import PEIPeriodoLetivo
from ..permissions import BackendTokenPermission
from django.core.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework import status

class PEIPeriodoLetivoViewSet(ModelViewSet):
    serializer_class = PEIPeriodoLetivoSerializer
    permission_classes = [BackendTokenPermission]

    # Pré-carregando componentes e disciplinas com cursos
    queryset = PEIPeriodoLetivo.objects.prefetch_related(
        'componentes_curriculares__disciplinas__cursos__coordenador'
    ).all()

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