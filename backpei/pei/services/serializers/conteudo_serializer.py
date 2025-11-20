from rest_framework import serializers
from pei.models.conteudo import Conteudo
class ConteudoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conteudo
        fields = '__all__'
        extra_kwargs = {
            "autor": {"required": False},
        }