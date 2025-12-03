from django.db import models
from django.conf import settings
from django.utils import timezone


class Acompanhamento(models.Model):
    """
    Representa um acompanhamento pedagógico oferecido ao estudante,
    permitindo que ele aceite ou recuse e registre formalmente sua decisão.
    """

    STATUS_CHOICES = [
        ("pendente", "Pendente"),
        ("aceito", "Aceito"),
        ("recusado", "Recusado"),
        ("concluido", "Concluído"),
    ]

    # Usuário alvo do acompanhamento (estudante ou responsável)
    aluno = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="acompanhamentos"
    )

    # Informações básicas do acompanhamento
    titulo = models.CharField(max_length=200)
    descricao = models.TextField()

    # Status atual
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pendente"
    )

    # Dados da recusa (se houver)
    motivo_recusa = models.TextField(null=True, blank=True)
    data_recusa = models.DateTimeField(null=True, blank=True)

    # Dados do aceite (se houver)
    data_aceite = models.DateTimeField(null=True, blank=True)

    # Controle de datas
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    def recusar(self, motivo: str):
        """Aplica recusa ao acompanhamento."""
        self.status = "recusado"
        self.motivo_recusa = motivo
        self.data_recusa = timezone.now()
        self.save()

    def aceitar(self):
        """Marca o acompanhamento como aceito."""
        self.status = "aceito"
        self.data_aceite = timezone.now()
        self.save()

    def __str__(self):
        return f"Acompanhamento #{self.id} - {self.titulo} ({self.status})"
