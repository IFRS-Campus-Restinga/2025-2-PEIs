from rest_framework import serializers
from pei.models.disciplina import Disciplina
from pei.services.serializers.curso_serializer import CursoSerializer  # ajuste o caminho conforme seu projeto

class DisciplinaSerializer(serializers.ModelSerializer):
    cursos = serializers.SerializerMethodField()

    class Meta:
        model = Disciplina
        fields = ['id', 'nome', 'cursos']

    def get_cursos(self, obj):
        # ManyToMany, precisamos usar .all()
        return CursoSerializer(obj.cursos.all(), many=True).data