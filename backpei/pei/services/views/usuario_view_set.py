from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from ..serializers import UsuarioSerializer
from ..permissions import BackendTokenPermission

User = get_user_model()

class UsuarioViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [BackendTokenPermission]
    
    def perform_create(self, serializer):
        user = self.request.user
        
        if not user.groups.filter(name="Professor").exists():
            raise ValidationError("Apenas professores podem criar pareceres.")
        
        serializer.save(professor=user)

    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ValidationError as e:
            return Response({"erro": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    


    #def destroy(self, request, *args, **kwargs):
    #    instance = self.get_object()
    #    try:
    #        instance.safe_delete()
    #        return Response(status=status.HTTP_204_NO_CONTENT)
    #    except ValidationError as e:
    #        return Response(
    #            {"erro": str(e)},
    #            status=status.HTTP_400_BAD_REQUEST
    #        )
