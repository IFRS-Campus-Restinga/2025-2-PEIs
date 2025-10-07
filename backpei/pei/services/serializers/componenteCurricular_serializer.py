from rest_framework import serializers
from pei.models import ComponenteCurricular
from pei.models import Disciplina
from pei.services.serializers.parecer_serializer import ParecerSerializer
from pei.services.serializers.disciplina_serializer import DisciplinaSerializer

class ComponenteCurricularSerializer(serializers.ModelSerializer):
    pareceres = ParecerSerializer(many=True, read_only=True)
    disciplina = DisciplinaSerializer(read_only=True)  # pega nome e id da disciplina
    disciplina_id = serializers.PrimaryKeyRelatedField(
        queryset=Disciplina.objects.all(),
        source="disciplinas",
        write_only=True
    )
    class Meta:
        model = ComponenteCurricular
        fields = '__all__'