from rest_framework import serializers
from pei.models.componenteCurricular import ComponenteCurricular
from pei.services.serializers.parecer_serializer import ParecerSerializer
from pei.services.serializers.disciplina_serializer import DisciplinaSerializer

class ComponenteCurricularSerializer(serializers.ModelSerializer):
    pareceres = ParecerSerializer(many=True, read_only=True)
    disciplina = DisciplinaSerializer(read_only=True, source="disciplinas")
    class Meta:
        model = ComponenteCurricular
        fields = [
            'id', 'pareceres', 'disciplina', 
            'objetivos', 'conteudo_prog', 'metodologia', 
            'periodo_letivo_id'  # se quiser manter o periodo_letivo
        ]