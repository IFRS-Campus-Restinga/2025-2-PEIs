from .base_model import BaseModel
from django.db import models
from django.core.validators import MinLengthValidator, MaxLengthValidator, RegexValidator
from django.core.exceptions import ValidationError
from ..validators.validador_texto import no_special_characters


class Napne(BaseModel):
    nome = models.CharField(
        max_length=100,
        validators=[MinLengthValidator(7), MaxLengthValidator(60), no_special_characters], )
      
    email = models.EmailField(unique=True)

    def __str__(self):
        return f"{self.nome} ({self.email})"
    
    def validar_email_institucional(value):
        if not value.endswith('@restinga.ifrs.edu.br'):
            raise ValidationError('O email deve ser institucional (@restinga.ifrs.edu.br)')
    