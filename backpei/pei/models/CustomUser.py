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
        # Prioriza o nome completo (first + last)
        nome_completo = f"{self.first_name} {self.last_name}".strip()
        if nome_completo:
            return f"{nome_completo} [{self.categoria}]"
        # Se não tiver nome, usa o username (email)
        return f"{self.username} [{self.categoria}]"
