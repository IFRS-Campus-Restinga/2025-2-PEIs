from rest_framework import serializers
from pei.models.parecer import Parecer
from pei.services.serializers.usuario_serializer import UsuarioSerializer
from pei.models.componenteCurricular import ComponenteCurricular
from django.contrib.auth import get_user_model

User = get_user_model()

class ParecerSerializer(serializers.ModelSerializer):
    # Read-only: retorna o objeto completo
    professor = UsuarioSerializer(read_only=True)
    componente_curricular = serializers.PrimaryKeyRelatedField(
        read_only=True
    )

    # Write-only: recebe apenas o ID
    professor_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source="professor",
        write_only=True
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
            'texto', 'data',
            'componente_curricular', 'componente_curricular_id'
        ]
