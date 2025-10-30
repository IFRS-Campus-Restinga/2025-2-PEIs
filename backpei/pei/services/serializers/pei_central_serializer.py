from rest_framework import serializers
from pei.models import *
<<<<<<< HEAD
from pei.services.serializers.PEIPeriodoLetivo_serializer import PEIPeriodoLetivoSerializer
from pei.models.aluno import Aluno
from .aluno_serializer import AlunoSerializer

class PeiCentralSerializer(serializers.ModelSerializer):
    periodos = PEIPeriodoLetivoSerializer(many=True, read_only=True)
    aluno = AlunoSerializer(read_only=True)
    aluno_id = serializers.PrimaryKeyRelatedField(
        queryset=Aluno.objects.all(), source="aluno", write_only=True
    )
    aluno_nome = serializers.CharField(source="aluno.nome", read_only=True)
=======
from .pei_periodo_letivo_serializer import PEIPeriodoLetivoSerializer

class PeiCentralSerializer(serializers.ModelSerializer):
    periodos = PEIPeriodoLetivoSerializer(many=True, read_only=True)
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d
    class Meta:
        model = PeiCentral
        fields = '__all__'