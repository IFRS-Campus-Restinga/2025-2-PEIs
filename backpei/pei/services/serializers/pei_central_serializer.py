from rest_framework import serializers
from pei.models import *
from .pei_periodo_letivo_serializer import PEIPeriodoLetivoSerializer

class PeiCentralSerializer(serializers.ModelSerializer):
    periodos = PEIPeriodoLetivoSerializer(many=True, read_only=True)
    class Meta:
        model = PeiCentral
        fields = '__all__'