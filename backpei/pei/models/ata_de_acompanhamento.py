from .base_model import BaseModel
from django.db import models
from django.core.validators import MinLengthValidator, MaxLengthValidator
from django.utils import timezone
from django.core.exceptions import ValidationError

def valida_data_futura(value):
    if value < timezone.now():
        raise ValidationError("A data da reunião deve ser no futuro.")

class AtaDeAcompanhamento(BaseModel):
    data_reuniao = models.DateTimeField(
        validators=[valida_data_futura],
        verbose_name="Data da Reunião"
    )
    participantes = models.CharField(
        max_length=100,
        validators=[MinLengthValidator(5), MaxLengthValidator(100)],
    )
    descricao = models.CharField(
        max_length=100,
        validators=[MinLengthValidator(5), MaxLengthValidator(100)],
    )
    ator = models.CharField(
        max_length=100,
        validators=[MinLengthValidator(5), MaxLengthValidator(100)],
    )

    def __str__(self):
        return f"Ata de acompanhamento - {self.id}"
