from .base_model import BaseModel
from django.db import models
from django.core.validators import MinLengthValidator, MaxLengthValidator, MinValueValidator, MaxValueValidator
from pei.enums.nivel import Nivel

class Curso(BaseModel):
    nome = models.CharField(max_length=255)
    nivel = models.CharField(
        max_length=3,
        choices=Nivel.choices,
        default=Nivel.MEDIO
    )

    def __str__(self):
        return f"{self.nome} ({self.get_nivel_display()})"