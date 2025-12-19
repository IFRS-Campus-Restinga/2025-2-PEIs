from rest_framework.viewsets import ModelViewSet
from pei.services.serializers import RegistroAcompanhamentoSerializer
from pei.models.registro_acompanhamento import RegistroAcompanhamento
from rest_framework.permissions import AllowAny

class RegistroAcompanhamentoViewSet(ModelViewSet):
    
    queryset = RegistroAcompanhamento.objects.all()
    serializer_class = RegistroAcompanhamentoSerializer
    permission_classes = [AllowAny]