from rest_framework import serializers
from pei.models.ataDeAcompanhamento import AtaDeAcompanhamento

class AtaDeAcompanhamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AtaDeAcompanhamento
        fields = '__all__'