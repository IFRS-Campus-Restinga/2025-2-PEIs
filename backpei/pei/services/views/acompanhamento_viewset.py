from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from pei.models.acompanhamento import Acompanhamento
from pei.services.serializers.acompanhamento_serializer import AcompanhamentoSerializer


class AcompanhamentoViewSet(ModelViewSet):
    queryset = Acompanhamento.objects.all()
    serializer_class = AcompanhamentoSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        acompanhamento = serializer.save()

        return Response({
            "acompanhamento": AcompanhamentoSerializer(acompanhamento).data,
            "email_enviado": serializer.context.get("email_enviado", False)
        }, status=201)
