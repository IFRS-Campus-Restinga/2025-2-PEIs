from rest_framework.viewsets import ModelViewSet
from ..serializers import *
from pei.models import *
from ..permissions import BackendTokenPermission
<<<<<<< HEAD
from django.core.exceptions import ValidationError
=======
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d

class PeiCentralViewSet(ModelViewSet):
    queryset = PeiCentral.objects.all()
    serializer_class = PeiCentralSerializer
<<<<<<< HEAD
    permission_classes = [BackendTokenPermission]
    
    def update(self, request, *args, **kwargs):
        print(">>> RECEBIDO PELO FRONT:", request.data)
        return super().update(request, *args, **kwargs)
    
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
