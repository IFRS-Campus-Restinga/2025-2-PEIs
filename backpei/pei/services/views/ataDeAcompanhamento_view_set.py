from rest_framework.viewsets import ModelViewSet
from ..serializers import AtaDeAcompanhamentoSerializer
from pei.models import AtaDeAcompanhamento
from ..permissions import BackendTokenPermission
<<<<<<< HEAD
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError
=======
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d

class AtaDeAcompanhamentoViewSet(ModelViewSet):
    queryset = AtaDeAcompanhamento.objects.all()
    serializer_class = AtaDeAcompanhamentoSerializer
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
