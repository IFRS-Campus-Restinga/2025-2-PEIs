from rest_framework import serializers
from pei.models.PEIPeriodoLetivo import PEIPeriodoLetivo
from pei.services.serializers.parecer_serializer import ParecerSerializer


class PEIPeriodoLetivoSerializer(serializers.ModelSerializer):
    pareceres = ParecerSerializer(many=True, read_only=True)  

    class Meta:
        model = PEIPeriodoLetivo
        fields = '__all__'