from rest_framework import serializers
from pei.models.aluno import Aluno
from pei.models.curso import Curso
# 👇 IMPORTANTE: Tem que importar o serializer do curso
from .curso_serializer import CursoSerializer 

class AlunoSerializer(serializers.ModelSerializer):
<<<<<<< HEAD
    curso_id = serializers.PrimaryKeyRelatedField(
=======
    # Campo para escrita (continua igual)
    curso = serializers.PrimaryKeyRelatedField(
>>>>>>> 3788010158520222ce0f4f017392395bc15fc2eb
        queryset=Curso.objects.all(),
        source="curso",
        required=False,
        allow_null=True
    )
    
    # 👇 O PULO DO GATO: Campo apenas leitura para o Front saber quem é o coordenador
    curso_detalhes = CursoSerializer(source='curso', read_only=True)

    class Meta:
        model = Aluno
<<<<<<< HEAD
        fields = '__all__'
        depth = 1
=======
        fields = '__all__'
>>>>>>> 3788010158520222ce0f4f017392395bc15fc2eb
