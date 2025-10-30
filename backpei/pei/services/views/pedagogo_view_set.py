from rest_framework.viewsets import ModelViewSet
from ..serializers.pedagogo_serializer import PedagogoSerializer
from pei.models import *
from ..permissions import BackendTokenPermission
<<<<<<< HEAD
from django.core.exceptions import ValidationError
=======
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d

class PedagogoViewSet(ModelViewSet):
    queryset = Pedagogo.objects.all()
    serializer_class = PedagogoSerializer
<<<<<<< HEAD
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
=======
    permission_classes = [BackendTokenPermission]
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d
