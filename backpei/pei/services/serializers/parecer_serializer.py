from rest_framework import serializers
from pei.models.parecer import Parecer
from pei.models.usuario import Usuario
from pei.services.serializers.usuario_serializer import UsuarioSerializer



class ParecerSerializer(serializers.ModelSerializer):
    professor = UsuarioSerializer(read_only=True)
    professor_id = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.all(), source="professor", write_only=True
    ) 
    class Meta:
        model = Parecer
        fields = '__all__'