from django.contrib.auth.models import AbstractUser
from django.db import models
from ..enums import CategoriaUsuario

class CustomUser(AbstractUser):
    # papel efetivo (Professor, Coordenador, etc)
    categoria = models.CharField(max_length=20, choices=CategoriaUsuario, default="PROFESSOR")

    aprovado = models.BooleanField(default=False)

    categoria_solicitada = models.CharField(max_length=50, null=True, blank=True)

    foto = models.URLField(max_length=500, null=True, blank=True)

    def __str__(self):
        return f"{self.username} - {self.first_name} - [{self.categoria}] - ({'Aprovado' if self.aprovado else 'Pendente'})"
