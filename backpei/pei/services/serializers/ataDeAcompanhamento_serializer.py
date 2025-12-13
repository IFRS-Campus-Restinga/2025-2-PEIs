from rest_framework import serializers
from pei.models.ataDeAcompanhamento import AtaDeAcompanhamento
class AtaDeAcompanhamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AtaDeAcompanhamento
        fields = '__all__'
        read_only_fields = ['autor', 'participantes_emails']

    def create(self, validated_data):
        request = self.context.get("request")
        if request:
            email_usuario = request.headers.get("X-User-Email")
            if email_usuario:
                validated_data["autor"] = email_usuario

        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data.pop("autor", None)
        validated_data.pop("participantes_emails", None)
        return super().update(instance, validated_data)