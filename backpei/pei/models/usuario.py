from .base_model import BaseModel
from django.db import models
from django.core.validators import MinLengthValidator, MaxLengthValidator
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User

# Validação extra do email institucional
def validar_email_institucional(value):
    if not value.endswith('ifrs.edu.br'):
        raise ValidationError('O email deve ser institucional (ifrs.edu.br)')

class Usuario(BaseModel):
    """
    Representa uma solicitação de acesso feita por um usuário
    antes de ser aprovado e vinculado a um Django User.
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        help_text="Usuário Django criado após aprovação."
    )

    nome = models.CharField(
        max_length=100,
        validators=[
            MinLengthValidator(5),
            MaxLengthValidator(100)
        ]
    )

    email = models.EmailField(
        unique=True,
        validators=[
            validar_email_institucional,
            MinLengthValidator(10),
            MaxLengthValidator(100)
        ]
    )

    aprovado = models.BooleanField(
        default=False,
        help_text="Indica se o admin já aprovou o acesso deste usuário."
    )

    categoria_solicitada = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        help_text="Qual papel o usuário deseja ter (professor, pedagogo, coordenador, admin...)."
    )

    def __str__(self):
        status = "Aprovado" if self.aprovado else "Pendente"
        return f"{self.email} ({status}) - {self.categoria_solicitada or 'sem categoria'}"
