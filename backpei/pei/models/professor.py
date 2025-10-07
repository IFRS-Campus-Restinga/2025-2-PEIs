from .base_model import BaseModel
from django.db import models
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError

def validar_email_institucional(value):
        if not value.endswith('@restinga.ifrs.edu.br'):
            raise ValidationError('O email deve ser institucional (@restinga.ifrs.edu.br)')


class Professor(BaseModel):
    nome = models.CharField(max_length=150, blank=False, null=False)
    matricula = models.CharField(
    max_length=20,
    unique=True,
    validators=[RegexValidator(r'^\d+$', 'A matrícula deve conter apenas números')]
)
    email = models.EmailField(unique=True, validators=[validar_email_institucional])
    
    # foto_perfil = models.ImageField(
    #     upload_to='fotos_professores/', 
    #     null=True, 
    #     blank=True,
    #     help_text="Upload da foto do professor"
    # )
    #--------> NÃO ESQUECER DE FAZER VALIDAÇÃO DO TAMANHO DA FOTO

    def __str__(self):
        return f"{self.nome} ({self.matricula})"
    
    