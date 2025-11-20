from rest_framework import serializers
from pei.models.parecer import Parecer
from pei.services.serializers.usuario_serializer import UsuarioSerializer
from django.contrib.auth import get_user_model

User = get_user_model()



class ParecerSerializer(serializers.ModelSerializer):
    professor = UsuarioSerializer(read_only=True)
    professor_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source="professor", write_only=True
    ) 
    class Meta:
        model = Parecer
        fields = '__all__'