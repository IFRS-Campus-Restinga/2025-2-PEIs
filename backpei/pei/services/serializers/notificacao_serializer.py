from rest_framework import serializers
from pei.models import Notificacao

class NotificacaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notificacao
        fields = '__all__'
