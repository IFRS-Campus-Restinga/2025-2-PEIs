from rest_framework import serializers
from pei.models.acompanhamento import Acompanhamento
from pei.utils.notificacoes_utils import enviar_email_acompanhamento


class AcompanhamentoSerializer(serializers.ModelSerializer):
    aluno_nome = serializers.CharField(source="aluno.first_name", read_only=True)

    class Meta:
        model = Acompanhamento
        fields = [
            "id",
            "aluno",
            "aluno_nome",
            "titulo",
            "descricao",
            "status",
            "motivo_recusa",
            "data_recusa",
            "data_aceite",
            "criado_em",
            "atualizado_em",
        ]
        read_only_fields = [
            "status",
            "motivo_recusa",
            "data_recusa",
            "data_aceite",
            "criado_em",
            "atualizado_em",
        ]

    def create(self, validated_data):
        acompanhamento = super().create(validated_data)

        try:
            enviar_email_acompanhamento(acompanhamento)
        except Exception as e:
            print("Erro ao enviar email de acompanhamento:", e)

        return acompanhamento
