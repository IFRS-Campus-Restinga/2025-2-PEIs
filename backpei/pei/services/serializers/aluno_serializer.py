from rest_framework import serializers
from pei.models.aluno import Aluno
from .curso_serializer import CursoSerializer


class AlunoSerializer(serializers.ModelSerializer):
    curso = CursoSerializer()
    class Meta:
        model = Aluno
        fields = '__all__'