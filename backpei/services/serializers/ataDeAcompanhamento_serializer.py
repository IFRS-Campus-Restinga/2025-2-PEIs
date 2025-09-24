from rest_framework import serializers
from pei.models import AtaDeAcompanhamento

class AtaDeAcompanhamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AtaDeAcompanhamento
        fields = '__all__'