from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from pei.models.notificacao import Notificacao
from pei.services.serializers.notificacao_serializer import NotificacaoSerializer

class NotificacaoViewSet(viewsets.ModelViewSet):
    serializer_class = NotificacaoSerializer
    # Garante que só mexemos nos dados do usuário logado!
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Filtra apenas as notificações do usuário atual
        return Notificacao.objects.filter(usuario=self.request.user).order_by('-data_criacao')

    # Nova ação personalizada: POST /services/notificacoes/marcar_todas_lidas/
    @action(detail=False, methods=['post'])
    def marcar_todas_lidas(self, request):
        # Pega todas as não lidas do usuário e marca como True
        qs = self.get_queryset().filter(lida=False)
        atualizadas = qs.update(lida=True)
        return Response(
            {"status": "ok", "mensagem": f"{atualizadas} notificações marcadas como lidas."},
            status=status.HTTP_200_OK
        )