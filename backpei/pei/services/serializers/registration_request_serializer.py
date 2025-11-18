# pei/services/serializers/registration_request_serializer.py
from rest_framework import serializers
from pei.models.registration_request import RegistrationRequest

class RegistrationRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistrationRequest
        fields = [
            "id",
            "name",
            "email",
            "profile",
            "status",
            "created_at",   # se existir no model
        ]
        read_only_fields = ["id", "status", "created_at"]
