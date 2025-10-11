from rest_framework import serializers
from pei.models import *
from pei.services.serializers.PEIPeriodoLetivo_serializer import PEIPeriodoLetivoSerializer
from pei.models.aluno import Aluno
from .aluno_serializer import AlunoSerializer

class PeiCentralSerializer(serializers.ModelSerializer):
    periodos = PEIPeriodoLetivoSerializer(many=True, read_only=True)
    aluno = AlunoSerializer(read_only=True)
    aluno_id = serializers.PrimaryKeyRelatedField(
        queryset=Aluno.objects.all(), source="professor", write_only=True
    )
    class Meta:
        model = PeiCentral
        fields = '__all__'