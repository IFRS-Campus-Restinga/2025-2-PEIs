from rest_framework.viewsets import ModelViewSet
from ..serializers.coordenadorCurso_serializer import *
from pei.models.coordenadorCurso import *
from ..permissions import BackendTokenPermission
from django.core.exceptions import ValidationError

class CoordenadorCursoViewSet(ModelViewSet):
    queryset = CoordenadorCurso.objects.all()
    serializer_class = CoordenadorCursoSerializer
    permission_classes = [BackendTokenPermission]

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