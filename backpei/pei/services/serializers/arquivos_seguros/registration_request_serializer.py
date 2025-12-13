from rest_framework import serializers
from pei.models.registration_request import RegistrationRequest


class RegistrationRequestStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistrationRequest
        fields = ["status"]

    def validate_status(self, value):
        # Garantir que o admin só possa definir APPROVED ou REJECTED
        if value not in ["APPROVED", "REJECTED"]:
            raise serializers.ValidationError(
                "Status inválido. Use: APPROVED ou REJECTED."
            )
        return value
