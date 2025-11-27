from rest_framework import serializers
from pei.models.aluno import Aluno
from pei.models.curso import Curso
from .curso_serializer import CursoSerializer 

class AlunoSerializer(serializers.ModelSerializer):
    curso_id = serializers.PrimaryKeyRelatedField(
        queryset=Curso.objects.all(),
        source="curso",
        required=False,
        allow_null=True
    )
    
    curso = CursoSerializer(read_only=True)

    class Meta:
        model = Aluno
        fields = '__all__'
