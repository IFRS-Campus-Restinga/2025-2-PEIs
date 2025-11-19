from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError
from rest_framework.permissions import IsAdminUser

from ..serializers import UsuarioSerializer
from pei.models import Usuario


class UsuarioViewSet(ModelViewSet):
    queryset = Usuario.objects.filter(aprovado=False)
    serializer_class = UsuarioSerializer
    permission_classes = [IsAdminUser]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            instance.safe_delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ValidationError as e:
            return Response(
                {"erro": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
