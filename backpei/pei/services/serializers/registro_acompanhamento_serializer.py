from pei.models.registro_acompanhamento import RegistroAcompanhamento
from rest_framework import serializers




class RegistroAcompanhamentoSerializer(serializers.ModelSerializer):

    class Meta:
        model = RegistroAcompanhamento
        fields = '__all__'
        

