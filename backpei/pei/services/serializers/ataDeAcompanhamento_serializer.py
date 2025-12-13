from rest_framework import serializers
from pei.models.ataDeAcompanhamento import AtaDeAcompanhamento

class AtaDeAcompanhamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AtaDeAcompanhamento
        fields = '__all__'
        # ator preenchido pelo backend, participantes_emails calculado
        read_only_fields = ['ator', 'participantes_emails'] 
