from rest_framework import serializers
from pei.models.componenteCurricular import ComponenteCurricular
from pei.models.disciplina import Disciplina

from pei.services.serializers.disciplina_serializer import DisciplinaSerializer
from pei.models.PEIPeriodoLetivo import PEIPeriodoLetivo


class ComponenteCurricularSerializer(serializers.ModelSerializer):
    pareceres = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    disciplinas_obj = DisciplinaSerializer(read_only=True, source="disciplinas")  # apenas leitura para GET
    disciplinas = serializers.PrimaryKeyRelatedField(
        queryset=Disciplina.objects.all(),
        write_only=True
    )

    periodo_letivo = serializers.PrimaryKeyRelatedField(
        queryset=PEIPeriodoLetivo.objects.all(),
        write_only=True
    )


    class Meta:
        model = ComponenteCurricular
        fields = [
            'id', 'pareceres', 'disciplinas', 'disciplinas_obj',
            'objetivos', 'conteudo_prog', 'metodologia', 
            'periodo_letivo'
        ]