from rest_framework import serializers
from django.contrib.auth import get_user_model
from pei.models.curso import Curso
from pei.models.disciplina import Disciplina
from pei.services.serializers.usuario_serializer import UsuarioSerializer

User = get_user_model()

class CursoSerializer(serializers.ModelSerializer):
    nivel = serializers.ChoiceField(choices=Curso._meta.get_field("nivel").choices)
    coordenador = UsuarioSerializer(read_only=True)
    coordenador_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(groups__name="Coordenador"),
        source="coordenador",
        write_only=True
    )
    arquivo_nome = serializers.SerializerMethodField()
    arquivo_upload = serializers.FileField(write_only=True, required=False)

    class Meta:
        model = Curso
        fields = ['id', 'nome', 'nivel', 'coordenador', 'coordenador_id', 'arquivo_nome', 'arquivo_upload']

    def get_arquivo_nome(self, obj):
        if obj.arquivo:
            return obj.arquivo.name.split('/')[-1]
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