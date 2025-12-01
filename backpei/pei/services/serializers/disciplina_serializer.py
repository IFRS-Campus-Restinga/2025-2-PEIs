from rest_framework import serializers
from pei.models.disciplina import Disciplina
from pei.services.serializers.curso_serializer import CursoSerializer  
from django.contrib.auth import get_user_model
User = get_user_model()

class ProfessorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'
        # Se quiser incluir categoria ou grupos, só avisar.

class DisciplinaSerializer(serializers.ModelSerializer):
    cursos = serializers.SerializerMethodField()
    professores = ProfessorSerializer(many=True, read_only=True)

    professores = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.filter(groups__name='Professor'),
        required=False,
        write_only=False,
    )

    class Meta:
        model = Disciplina
        fields = ['id', 'nome', 'cursos', 'professores']

    def get_cursos(self, obj):
        # ManyToMany, precisamos usar .all()
        return CursoSerializer(obj.cursos.all(), many=True).data