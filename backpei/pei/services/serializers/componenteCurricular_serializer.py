from rest_framework import serializers
from pei.models.componenteCurricular import ComponenteCurricular
from pei.models.disciplina import Disciplina
from pei.services.serializers.parecer_serializer import ParecerSerializer
from pei.services.serializers.disciplina_serializer import DisciplinaSerializer
from pei.models.PEIPeriodoLetivo import PEIPeriodoLetivo

class PEIPeriodoLetivoMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = PEIPeriodoLetivo
        fields = ['id', 'periodo_principal']


class ComponenteCurricularSerializer(serializers.ModelSerializer):
    pareceres = ParecerSerializer(many=True, read_only=True)
    disciplina = DisciplinaSerializer(read_only=True, source="disciplinas")  # apenas leitura para GET
    disciplinas = serializers.PrimaryKeyRelatedField(
        queryset=Disciplina.objects.all(),
        write_only=True
    )

    # GET → períodos letivos completos (ou resumidos)
    periodos_letivos = PEIPeriodoLetivoMinimalSerializer(
        many=True, read_only=True
    )

    # POST/PUT → somente IDs
    periodos_letivos_id = serializers.PrimaryKeyRelatedField(
        source="periodos_letivos",
        many=True,
        queryset=PEIPeriodoLetivo.objects.all(),
        write_only=True
    )

    # Campo calculado (opcional)
    periodos_principais = serializers.SerializerMethodField()

    def get_periodos_principais(self, obj):
        return [p.periodo_principal for p in obj.periodos_letivos.all()]

    class Meta:
        model = ComponenteCurricular
        fields = [
            'id', 'pareceres', 'disciplina', 'disciplinas',
            'objetivos', 'conteudo_prog', 'metodologia',
            'periodos_letivos',       # GET
            'periodos_letivos_id',    # POST/PUT
            'periodos_principais'
        ]