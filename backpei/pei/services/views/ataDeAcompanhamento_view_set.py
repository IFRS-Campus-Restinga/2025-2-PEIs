from rest_framework.viewsets import ModelViewSet
from ..serializers import AtaDeAcompanhamentoSerializer
from pei.models import AtaDeAcompanhamento
from ..permissions import BackendTokenPermission
from django.core.exceptions import ValidationError

class AtaDeAcompanhamentoViewSet(ModelViewSet):
    queryset = AtaDeAcompanhamento.objects.all()
    serializer_class = AtaDeAcompanhamentoSerializer
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