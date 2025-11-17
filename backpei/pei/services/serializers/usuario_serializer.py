# pei/services/serializers/usuario_serializer.py

from rest_framework import serializers
from pei.models.usuario import Usuario
from pei.models.registration_request import RegistrationRequest


# --------------------------
# Serializer do modelo USUÁRIO
# --------------------------
class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = [
            'id',
            'nome',
            'email',
            'categoria',
            'status'
        ]


# ----------------------------------------
# Serializers do modelo REGISTRATION REQUEST
# ----------------------------------------
class RegistrationRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistrationRequest
        fields = [
            'id',
            'name',
            'email',
            'profile',
            'message',
            'status',
            'created_at'
        ]
        read_only_fields = ['id', 'status', 'created_at']


class RegistrationRequestStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistrationRequest
        fields = [
            'id',
            'status',
            'reviewed_at',
            'created_user'
        ]
        read_only_fields = ['id', 'status', 'reviewed_at', 'created_user']
