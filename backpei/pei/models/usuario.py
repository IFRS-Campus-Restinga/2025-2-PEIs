from .base_model import BaseModel
from django.db import models
from ..enums import CategoriaUsuario
from django.core.validators import MinLengthValidator, MaxLengthValidator
from django.core.exceptions import ValidationError
# apenas uma validacao a mais no email, ja existe tambem no frontend
def validar_email_institucional(value):
        if not value.endswith('ifrs.edu.br'):
            raise ValidationError('O email deve ser institucional (ifrs.edu.br)')
# decidimos por nao usar a classe user do django por adicionar camadas a mais de complexidade
class Usuario(BaseModel):
    email = models.EmailField( unique=True, validators=[validar_email_institucional, MinLengthValidator(10), MaxLengthValidator(100)] )
    categoria = models.CharField( max_length=15, choices=CategoriaUsuario.choices )