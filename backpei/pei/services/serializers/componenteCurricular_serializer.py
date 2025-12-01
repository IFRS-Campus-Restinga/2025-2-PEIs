from rest_framework import serializers
from pei.models.componenteCurricular import ComponenteCurricular
from pei.models.disciplina import Disciplina
from pei.services.serializers.parecer_serializer import ParecerSerializer
from pei.services.serializers.disciplina_serializer import DisciplinaSerializerParecer
from pei.models.PEIPeriodoLetivo import PEIPeriodoLetivo


class ComponenteCurricularSerializer(serializers.ModelSerializer):
    pareceres = ParecerSerializer(many=True, read_only=True)
    disciplina = DisciplinaSerializerParecer(read_only=True, source="disciplinas")  # apenas leitura para GET
    disciplinas_id = serializers.PrimaryKeyRelatedField(
        source="disciplinas",
        queryset=Disciplina.objects.all(),
        write_only=True
    )

    periodo_letivo_id = serializers.PrimaryKeyRelatedField(
        source="periodo_letivo",
        queryset=PEIPeriodoLetivo.objects.all(),
        write_only=True
    )

    class Meta:
        model = ComponenteCurricular
        fields = [
            'id', 'pareceres', 'disciplina', 'disciplinas_id',
            'objetivos', 'conteudo_prog', 'metodologia', 
            'periodo_letivo_id'
        ]