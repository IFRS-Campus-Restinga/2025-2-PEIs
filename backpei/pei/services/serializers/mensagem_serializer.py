from rest_framework import serializers
from ...models.mensagem import Mensagem

class MensagemSerializer(serializers.ModelSerializer):
    remetente_nome = serializers.CharField(source="remetente.username", read_only=True)
    destinatario_nome = serializers.CharField(source="destinatario.username", read_only=True)

    class Meta:
        model = Mensagem
        fields = ['id', 'remetente', 'remetente_nome', 'destinatario', 'destinatario_nome', 'corpo', 'created_at']
