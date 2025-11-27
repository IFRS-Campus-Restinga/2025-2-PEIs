from rest_framework import serializers
from pei.models.aluno import Aluno
from pei.models.curso import Curso
# 👇 IMPORTANTE: Tem que importar o serializer do curso
from .curso_serializer import CursoSerializer 

class AlunoSerializer(serializers.ModelSerializer):
    # Campo para escrita (continua igual)
    curso = serializers.PrimaryKeyRelatedField(
        queryset=Curso.objects.all(),
        required=False,
        allow_null=True
    )
    
    # 👇 O PULO DO GATO: Campo apenas leitura para o Front saber quem é o coordenador
    curso_detalhes = CursoSerializer(source='curso', read_only=True)

    class Meta:
        model = Aluno
        fields = '__all__'