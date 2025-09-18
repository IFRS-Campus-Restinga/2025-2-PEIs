from .base_model import BaseModel
from django.db import models

class Disciplina(BaseModel):
    nome = models.CharField(max_length=255)
    cursos = models.ManyToManyField("Curso", related_name="disciplinas")

    def __str__(self):
        return self.nome