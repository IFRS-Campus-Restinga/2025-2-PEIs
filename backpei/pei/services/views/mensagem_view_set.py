from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from ...models.mensagem import Mensagem
from ..serializers.mensagem_serializer import MensagemSerializer
from ...permissions.chatPermission import ChatPermission


class MensagemViewSet(viewsets.ModelViewSet):
    serializer_class = MensagemSerializer
    permission_classes = [ChatPermission]

    # Só retorna mensagens do usuário logado (segurança)
    def get_queryset(self):
        user = self.request.user
        return Mensagem.objects.filter(
            remetente=user
        ) | Mensagem.objects.filter(
            destinatario=user
        )

    # Conversa entre o usuário logado e outro usuário selecionado
    @action(detail=False, methods=['get'])
    def conversa(self, request):
        usuario_atual = request.user.id
        outro_usuario = request.query_params.get("com")

        if not outro_usuario:
            return Response([])

        mensagens = Mensagem.objects.filter(
            remetente__in=[usuario_atual, outro_usuario],
            destinatario__in=[usuario_atual, outro_usuario]
        ).order_by("data_envio")

        serializer = MensagemSerializer(mensagens, many=True)
        return Response(serializer.data)
