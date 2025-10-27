from rest_framework.viewsets import ModelViewSet
from ..serializers.parecer_serializer import *
from pei.models.parecer import *
from ..permissions import BackendTokenPermission

class ParecerViewSet(ModelViewSet):
    queryset = Parecer.objects.all()
    serializer_class = ParecerSerializer
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