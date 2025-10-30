from rest_framework.viewsets import ModelViewSet
from ..serializers import *
from pei.models import *
from ..permissions import BackendTokenPermission
from django.core.exceptions import ValidationError

class PeiCentralViewSet(ModelViewSet):
    queryset = PeiCentral.objects.all()
    serializer_class = PeiCentralSerializer
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