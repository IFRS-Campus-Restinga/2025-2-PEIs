from .base_model import BaseModel
from django.db import models
from django.core.validators import MinLengthValidator, MaxLengthValidator
from django.utils import timezone
from django.core.exceptions import ValidationError

def validaDataFutura(value):
    if value < timezone.now():
        raise ValidationError("A data da reunião deve ser no futuro.")

class AtaDeAcompanhamento(BaseModel):
    dataReuniao = models.DateTimeField(
        validators=[validaDataFutura],
        verbose_name="Data da Reunião"
    )
    dataFim = models.DateTimeField(
        verbose_name="Data de Fim da Reunião"
    )
    participantes = models.CharField(
        max_length=500,
        validators=[MinLengthValidator(5), MaxLengthValidator(500)],
        help_text="Lista de participantes (texto, emails separados por vírgula)."
    )
    # guarda lista de emails em formato JSON para uso no envio/cancelamento
    participantes_emails = models.JSONField(default=list, blank=True)
    descricao = models.CharField(
        max_length=200,
        validators=[MinLengthValidator(1), MaxLengthValidator(200)],
    )
    ator = models.EmailField(
        max_length=200,
        blank=True,
        validators=[],
        help_text="Email do criador (preenchido pelo backend via header X-User-Email)"
    )
    peiperiodoletivo = models.ForeignKey(
        "PEIPeriodoLetivo",
        on_delete=models.CASCADE,
        related_name="atasDeAcompanhamento"
    )

    def __str__(self):
        return f"Ata de acompanhamento - {self.id} - {self.descricao}"
