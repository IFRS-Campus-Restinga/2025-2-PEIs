from .base_model import BaseModel
from django.db import models
from django.core.validators import MinLengthValidator, MaxLengthValidator, RegexValidator
from django.core.exceptions import ValidationError
from ..validators.validador_texto import no_special_characters
from ..validators.unique_validator import UniqueValidator
from ..validators.messages import MESSAGES
from .curso import Curso



class Aluno(BaseModel):
    nome = models.CharField(
        max_length=100,
        unique=True,
        validators=[MinLengthValidator(7), MaxLengthValidator(60), 
                    no_special_characters,])
    
    matricula = models.CharField(
        max_length=20,
        unique=True,
        validators=[RegexValidator(r'^\d+$', 'A matrícula deve conter apenas números')])
    
    email = models.EmailField(
        unique=True)

    curso = models.ForeignKey(
        Curso,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="aluno"
    )
    def __str__(self):
        return f"{self.nome} ({self.matricula})"
    
    def validar_email_institucional(value):
        if not value.endswith('@restinga.ifrs.edu.br'):
            raise ValidationError('O email deve ser institucional (@restinga.ifrs.edu.br)')
    