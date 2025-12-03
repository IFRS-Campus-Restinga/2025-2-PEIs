from rest_framework import serializers
from pei.models.acompanhamento import Acompanhamento


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
