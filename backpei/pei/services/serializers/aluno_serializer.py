from rest_framework import serializers
from pei.models.aluno import Aluno
from pei.models.curso import Curso
from .curso_serializer import CursoSerializer 

class AlunoSerializer(serializers.ModelSerializer):
    curso = serializers.PrimaryKeyRelatedField(
        queryset=Curso.objects.all(),
        required=False,
        allow_null=True
    )

    curso_obj = CursoSerializer(read_only=True, source="curso_completo")



    class Meta:
        model = Aluno
        fields = '__all__'