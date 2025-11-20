from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from pei.models.usuario import Usuario
from pei.services.serializers.usuario_serializer import UsuarioSerializer

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated], url_path='me')
    def me(self, request):
        # tenta localizar perfil Usuario por email do request.user
        user = request.user
        perfil = Usuario.objects.filter(email=user.email).first()
        if perfil:
            serializer = UsuarioSerializer(perfil)
            return Response(serializer.data)
        else:
            # se não existir perfil, retorna dados básicos de user
            return Response({
                "email": user.email,
                "nome": getattr(user, "first_name", "")
            })
