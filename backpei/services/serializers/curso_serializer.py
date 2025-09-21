from rest_framework import serializers
from pei.models import Curso, Disciplina
from services.serializers.disciplina_serializer import DisciplinaSerializer

class CursoSerializer(serializers.ModelSerializer):
    disciplinas = DisciplinaSerializer(many=True, read_only=True)
    disciplinas_ids = serializers.PrimaryKeyRelatedField(
        queryset=Disciplina.objects.all(),
        source="disciplinas",  # importante usar o mesmo nome do campo M2M
        many=True,
        write_only=True
    )
    nivel = serializers.ChoiceField(choices=Curso._meta.get_field("nivel").choices)

    class Meta:
        model = Curso
        fields = ["id", "name", "nivel", "disciplinas", "disciplinas_ids"]
