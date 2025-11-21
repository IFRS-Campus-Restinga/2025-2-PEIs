from rest_framework.viewsets import ModelViewSet
from ..serializers import DocumentacaoComplementarSerializer
from pei.models.documentacaoComplementar import DocumentacaoComplementar
from ..permissions import BackendTokenPermission
from django.core.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework import status

class DocumentacaoComplementarViewSet(ModelViewSet):
    queryset = DocumentacaoComplementar.objects.all()
    serializer_class = DocumentacaoComplementarSerializer
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