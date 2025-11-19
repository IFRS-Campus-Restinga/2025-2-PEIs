from rest_framework import serializers
from pei.models import Conteudo
class ConteudoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conteudo
        fields = '__all__'
        extra_kwargs = {
            "autor": {"required": False},
        }