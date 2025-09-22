from django.db import models
from .base_model import BaseModel
from ..enums.nivel import Nivel
from django.core.validators import MinLengthValidator
from .coordenadorCurso import CoordenadorCurso

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
    coordenador = models.ForeignKey(CoordenadorCurso, on_delete=models.RESTRICT, related_name="coordenador")

    def __str__(self):
        return f'{self.name} - {self.coordenador}'