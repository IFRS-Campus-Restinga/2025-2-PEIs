from rest_framework import serializers
from pei.models.parecer import Parecer
from pei.services.serializers.usuario_serializer import UsuarioSerializer
from pei.models.componenteCurricular import ComponenteCurricular
from django.contrib.auth import get_user_model
from pei.services.serializers.componenteCurricular_serializer import ComponenteCurricularSerializer

User = get_user_model()

class ParecerSerializer(serializers.ModelSerializer):
    # Read-only: retorna o objeto completo
    professor = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True
    )
    componente_curricular = serializers.PrimaryKeyRelatedField(
        queryset=ComponenteCurricular.objects.all(),
        write_only=True
    )

    # Write-only: recebe apenas o ID
    professor_obj = UsuarioSerializer(read_only = True, source="professor")
    
    componente_curricular_obj = ComponenteCurricularSerializer(read_only = True, source="componente_curricular")
    

    class Meta:
        model = Parecer
        fields = [
            'id', 'professor', 'professor_obj',
            'texto', 'data',
            'componente_curricular', 'componente_curricular_obj'
        ]
