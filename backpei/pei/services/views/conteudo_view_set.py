from rest_framework.viewsets import ModelViewSet
from ..serializers import ConteudoSerializer
from pei.models import Conteudo
from ..permissions import BackendTokenPermission

class ConteudoViewSet(ModelViewSet):
    queryset = Conteudo.objects.all()
    serializer_class = ConteudoSerializer
    permission_classes = [BackendTokenPermission]
    # necessario sobrescrever para receber necessariamente o email do front
    def perform_create(self, serializer):
        email = self.request.headers.get("X-User-Email")
        serializer.save(autor=email)