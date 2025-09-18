from django.db import models
from .base_model import BaseModel
from ..enumerations.nivel import Nivel
from django.core.validators import MinLengthValidator

class Curso(BaseModel):
    name = models.CharField(
        blank=False, null=False,
        max_length=100, 
        validators=[MinLengthValidator(1)]
    )
    nivel = models.CharField(
        blank=False, null=False,
        max_length=100,
        validators=[MinLengthValidator(1)],
        choices=Nivel, default=Nivel.NOT_INFORMED,
    )
    disciplinas = models.ManyToManyField("Disciplina", related_name="cursos", blank=True)
    #coordenador = oneToManyField(Coordenador, blank=False, null=False)

    def __str__(self):
        return f'{self.name}'