from rest_framework.response import Response
from rest_framework import status
from django.db.models import ProtectedError
from rest_framework.viewsets import ModelViewSet
from ..serializers import *
from pei.models.pei_central import PeiCentral
from ..permissions import BackendTokenPermission
from django.core.exceptions import ValidationError
from rest_framework.permissions import DjangoObjectPermissions

class PeiCentralViewSet(ModelViewSet):
    queryset = PeiCentral.objects.all().order_by('id')
    serializer_class = PeiCentralSerializer
    permission_classes = [DjangoObjectPermissions]
    
    def update(self, request, *args, **kwargs):
        print(">>> RECEBIDO PELO FRONT:", request.data)
        return super().update(request, *args, **kwargs)
    
    
    
    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.delete()
            return Response(
                {"message": "PEI Central deletado com sucesso."},
                status=status.HTTP_204_NO_CONTENT
            )
        except ProtectedError:
            return Response(
                {"error": "Este PEI não pode ser deletado pois está vinculado a outros registros."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )