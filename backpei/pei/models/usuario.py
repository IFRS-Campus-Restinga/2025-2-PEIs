from .base_model import BaseModel
from django.db import models
from ..enums import CategoriaUsuario
from django.core.validators import MinLengthValidator, MaxLengthValidator
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group  

# validação extra do email institucional
def validar_email_institucional(value):
    if not value.endswith('ifrs.edu.br'):
        raise ValidationError('O email deve ser institucional (ifrs.edu.br)')

UserModel = get_user_model()

class Usuario(BaseModel):
    STATUS_PENDENTE = 'PENDING'
    STATUS_APROVADO = 'APPROVED'
    STATUS_REJEITADO = 'REJECTED'

    STATUS_CHOICES = [
        (STATUS_PENDENTE, 'Pendente'),
        (STATUS_APROVADO, 'Aprovado'),
        (STATUS_REJEITADO, 'Rejeitado'),
    ]

    # link opcional ao User padrão do Django
    user = models.OneToOneField(UserModel, null=True, blank=True, on_delete=models.CASCADE, related_name="perfil_usuario")

    nome = models.CharField(
        max_length=100,
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
        max_length=20,
        choices=CategoriaUsuario.choices,
        default=CategoriaUsuario.PROFESSOR
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDENTE
    )

    grupos = models.ManyToManyField(Group, blank=True) 

    def __str__(self):
        return f"{self.email} - {self.categoria}"
