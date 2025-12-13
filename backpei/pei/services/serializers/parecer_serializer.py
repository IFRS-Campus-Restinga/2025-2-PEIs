from rest_framework import serializers
from pei.models.parecer import Parecer
from pei.services.serializers.usuario_serializer import UsuarioSerializer
from pei.models.componenteCurricular import ComponenteCurricular
from django.contrib.auth import get_user_model
from pei.services.serializers.aluno_serializer import AlunoSerializer
from pei.models.aluno import Aluno

User = get_user_model()

class ParecerSerializer(serializers.ModelSerializer):
    # Read-only: retorna o objeto completo
    professor = UsuarioSerializer(read_only=True)
    aluno = AlunoSerializer(read_only=True)  # <-- adicionar aqui
    componente_curricular = serializers.PrimaryKeyRelatedField(
        read_only=True
    )

    # Write-only: recebe apenas o ID
    professor_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source="professor",
        write_only=True
    )
    aluno_id = serializers.PrimaryKeyRelatedField(      
        queryset=Aluno.objects.all(),
        source="aluno",
        write_only=True,
        required=False
    )
    componente_curricular_id = serializers.PrimaryKeyRelatedField(
        queryset=ComponenteCurricular.objects.all(),
        source="componente_curricular",
        write_only=True
    )

    class Meta:
        model = Parecer
        fields = [
            'id', 'professor', 'professor_id',
            'aluno', 'aluno_id',          
            'texto', 'data',
            'componente_curricular', 'componente_curricular_id'
        ]
