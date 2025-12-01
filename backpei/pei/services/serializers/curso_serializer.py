from rest_framework import serializers
from pei.models.curso import Curso
from pei.models.disciplina import Disciplina
from pei.services.serializers.usuario_serializer import UsuarioSerializer
from django.contrib.auth import get_user_model

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

    # Aqui: permitir escrita e leitura de ManyToMany
    disciplinas = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Disciplina.objects.all(),
        required=False
    )

    class Meta:
        model = Curso
        fields = ['id', 'nome', 'nivel', 'coordenador', 'coordenador_id',
                  'arquivo_nome', 'arquivo_upload', 'disciplinas']

    def get_arquivo_nome(self, obj):
        if obj.arquivo:
            return obj.arquivo.name.split('/')[-1]
        return None

    def create(self, validated_data):
        disciplinas = validated_data.pop("disciplinas", [])
        arquivo = validated_data.pop("arquivo_upload", None)
        if arquivo:
            validated_data["arquivo"] = arquivo
        curso = super().create(validated_data)
        if disciplinas:
            curso.disciplinas.set(disciplinas)
        return curso

    def update(self, instance, validated_data):
        disciplinas = validated_data.pop("disciplinas", None)
        arquivo = validated_data.pop("arquivo_upload", None)
        if arquivo:
            instance.arquivo = arquivo
        instance = super().update(instance, validated_data)
        if disciplinas is not None:
            instance.disciplinas.set(disciplinas)
        return instance
    
    def to_internal_value(self, data):
        # Permitir que o front envie "coordenador": 5
        # ou "coordenador": { "id": 5 }
        if "coordenador" in data and "coordenador_id" not in data:
            value = data["coordenador"]

            # se vier objeto { id: X }
            if isinstance(value, dict) and "id" in value:
                data = data.copy()
                data["coordenador_id"] = value["id"]
            else:
                # se vier número direto
                data = data.copy()
                data["coordenador_id"] = value

        return super().to_internal_value(data)