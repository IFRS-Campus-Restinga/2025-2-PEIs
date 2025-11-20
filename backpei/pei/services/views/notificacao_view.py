from rest_framework import viewsets
from pei.models.notificacao import Notificacao
from pei.services.serializers.notificacao_serializer import NotificacaoSerializer

class NotificacaoViewSet(viewsets.ModelViewSet):
    queryset = Notificacao.objects.all().order_by('-data_criacao')
    serializer_class = NotificacaoSerializer
