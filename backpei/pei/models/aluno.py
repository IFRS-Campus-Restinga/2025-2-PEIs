from .base_model import BaseModel
from django.db import models
from django.core.validators import MinLengthValidator, MaxLengthValidator, RegexValidator
from django.core.exceptions import ValidationError


class Aluno(BaseModel):
    nome = models.CharField(
        max_length=100,
        validators=[MinLengthValidator(7), MaxLengthValidator(60)])
    
    matricula = models.CharField(
    max_length=20,
    unique=True,
    validators=[RegexValidator(r'^\d+$', 'A matrícula deve conter apenas números')]
)
    email = models.EmailField(unique=True)

    def __str__(self):
        return f"{self.nome} ({self.matricula})"
    
    def validar_email_institucional(value):
        if not value.endswith('@restinga.ifrs.edu.br'):
            raise ValidationError('O email deve ser institucional (@restinga.ifrs.edu.br)')
    