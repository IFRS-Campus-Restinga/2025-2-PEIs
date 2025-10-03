from rest_framework import serializers
from pei.models import Curso, Disciplina, CoordenadorCurso
from pei.services.serializers.disciplina_serializer import DisciplinaSerializer
from pei.services.serializers.coordenadorCurso_serializer import CoordenadorCursoSerializer

class CursoSerializer(serializers.ModelSerializer):
    disciplinas = DisciplinaSerializer(many=True, read_only=True)
    disciplinas_ids = serializers.PrimaryKeyRelatedField(
        queryset=Disciplina.objects.all(),
        source="disciplinas",
        many=True,
        write_only=True
    )
    nivel = serializers.ChoiceField(choices=Curso._meta.get_field("nivel").choices)

    coordenador = CoordenadorCursoSerializer(read_only=True)
    coordenador_id = serializers.PrimaryKeyRelatedField(
        queryset=CoordenadorCurso.objects.all(),
        source="coordenador",
        write_only=True
    )

    class Meta:
        model = Curso
        fields = [
            "id", "name", "nivel",
            "disciplinas", "disciplinas_ids",
            "coordenador", "coordenador_id"
        ]
