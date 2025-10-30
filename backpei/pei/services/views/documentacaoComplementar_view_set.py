from rest_framework.viewsets import ModelViewSet
from ..serializers import DocumentacaoComplementarSerializer
from pei.models import DocumentacaoComplementar
from ..permissions import BackendTokenPermission
<<<<<<< HEAD
from django.core.exceptions import ValidationError
=======
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d

class DocumentacaoComplementarViewSet(ModelViewSet):
    queryset = DocumentacaoComplementar.objects.all()
    serializer_class = DocumentacaoComplementarSerializer
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
