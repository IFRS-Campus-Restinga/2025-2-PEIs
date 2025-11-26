from rest_framework import serializers
from pei.models.aluno import Aluno
from pei.models.curso import Curso


class AlunoSerializer(serializers.ModelSerializer):
    curso = serializers.PrimaryKeyRelatedField(
        queryset=Curso.objects.all(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = Aluno
        fields = '__all__'
