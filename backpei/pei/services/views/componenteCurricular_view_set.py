from rest_framework.viewsets import ModelViewSet
from ..serializers.componenteCurricular_serializer import ComponenteCurricularSerializer
from pei.models import ComponenteCurricular
from ..permissions import BackendTokenPermission
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError


class ComponenteCurricularViewSet(ModelViewSet):
    queryset = ComponenteCurricular.objects.all()
    serializer_class = ComponenteCurricularSerializer
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