from rest_framework import serializers
from pei.models import Curso, Disciplina
from pei.services.serializers.disciplina_serializer import DisciplinaSerializer
from pei.services.serializers.usuario_serializer import UsuarioSerializer
from pei.models.usuario import Usuario


class CursoSerializer(serializers.ModelSerializer):
    disciplinas = DisciplinaSerializer(many=True, read_only=True)
    disciplinas_ids = serializers.PrimaryKeyRelatedField(
        queryset=Disciplina.objects.all(),
        source="disciplinas",
        many=True,
        write_only=True
    )
    nivel = serializers.ChoiceField(choices=Curso._meta.get_field("nivel").choices)
    coordenador = UsuarioSerializer(read_only=True)
    coordenador_id = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.all(),
        source="usuario",
        write_only=True
    )
    arquivo_nome = serializers.SerializerMethodField()
    arquivo_upload = serializers.FileField(write_only=True, required=False)

    class Meta:
        model = Curso
        fields = [
            "id", "nome", "nivel",
            "disciplinas", "disciplinas_ids",
            "coordenador", "coordenador_id",
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
