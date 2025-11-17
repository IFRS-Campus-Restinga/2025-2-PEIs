from .base_model import BaseModel
from django.db import models
from ..enums import CategoriaUsuario
from django.core.validators import MinLengthValidator, MaxLengthValidator, RegexValidator
from django.core.exceptions import ValidationError
from django.contrib.auth.models import Group, User

# validação extra do email institucional
def validar_email_institucional(value):
    if not value.endswith('ifrs.edu.br'):
        raise ValidationError('O email deve ser institucional (ifrs.edu.br)')

class Usuario(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)

    nome = models.CharField(
        validators=[
            MinLengthValidator(10),
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
    categoria = models.CharField(
        max_length=100,
        choices=CategoriaUsuario.choices,
        default=CategoriaUsuario.PROFESSOR
    )

    grupos = models.ManyToManyField(Group, blank=True) 

    def __str__(self):
        return f"{self.email} - {self.categoria}"
