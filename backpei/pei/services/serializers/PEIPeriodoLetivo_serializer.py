from rest_framework import serializers
from pei.models.PEIPeriodoLetivo import PEIPeriodoLetivo
from pei.services.serializers.componenteCurricular_serializer import ComponenteCurricularSerializer


class PEIPeriodoLetivoSerializer(serializers.ModelSerializer): 
    componentes_curriculares = ComponenteCurricularSerializer(many=True, read_only=True)
    aluno_nome = serializers.CharField(source="pei_central.aluno.nome", read_only=True)

    class Meta:
        model = PEIPeriodoLetivo
        fields = '__all__'