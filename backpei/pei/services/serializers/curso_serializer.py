from rest_framework import serializers
from pei.models import Curso, Disciplina, CoordenadorCurso
from pei.services.serializers.disciplina_serializer import DisciplinaSerializer
<<<<<<< HEAD
from pei.services.serializers.coordenadorCurso_serializer import CoordenadorCursoSerializer
=======
from pei.services.serializers.coordenador_curso_serializer import CoordenadorCursoSerializer
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d

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
<<<<<<< HEAD
    arquivo_nome = serializers.SerializerMethodField()
    arquivo_upload = serializers.FileField(write_only=True, required=False)
=======
    arquivo = serializers.FileField(required=False, allow_null=True)

>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d

    class Meta:
        model = Curso
        fields = [
            "id", "name", "nivel",
            "disciplinas", "disciplinas_ids",
            "coordenador", "coordenador_id",
<<<<<<< HEAD
            "arquivo", "arquivo_upload",
            "arquivo_nome",
        ]

    def get_arquivo_nome(self, obj):
        if obj.arquivo:
            return obj.arquivo.name.split('/')[-1]  # apenas o nome do arquivo
        return None
    
    def create(self, validated_data):
        arquivo = validated_data.pop("arquivo_upload", None)
        if arquivo:
            validated_data["arquivo"] = arquivo
        return super().create(validated_data)

    def update(self, instance, validated_data):
        arquivo = validated_data.pop("arquivo_upload", None)
        if arquivo:
            instance.arquivo = arquivo
        return super().update(instance, validated_data)
=======
            "arquivo",
        ]
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d
