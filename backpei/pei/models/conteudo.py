from .base_model import BaseModel
from django.db import models
from django.core.validators import MinLengthValidator, MaxLengthValidator
from django.core.exceptions import ValidationError

def validar_email_institucional(value):
    if not value.endswith('ifrs.edu.br'):
        raise ValidationError('O email deve ser institucional (ifrs.edu.br)')

class Conteudo(BaseModel):
    autor = models.EmailField(validators=[ validar_email_institucional, MinLengthValidator(10), MaxLengthValidator(100) ])
    texto = models.TextField()
    emails_autorizados = models.JSONField(default=list, blank=True)
    grupos_autorizados = models.JSONField(default=list, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.autor} - {self.texto}"