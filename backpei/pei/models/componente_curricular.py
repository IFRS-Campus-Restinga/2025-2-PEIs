from .base_model import BaseModel
from django.db import models
from django.core.validators import MinLengthValidator, MaxLengthValidator, MinValueValidator, MaxValueValidator

class ComponenteCurricular(BaseModel):
    objetivos = models.CharField(
        max_length=100,
        validators=[MinLengthValidator(7), MaxLengthValidator(100)], )
    conteudo_prog = models.CharField(
        max_length=100,
        validators=[MinLengthValidator(1), MaxLengthValidator(3)], )
    metodologia = models.CharField(
        max_length=100,
        validators=[MinLengthValidator(7), MaxLengthValidator(255)], )
    disciplinas = models.OneToOneField("Disciplina", related_name="componentes_curriculares", on_delete=models.CASCADE)

    
    def __str__(self):
        return f"Componente curricular - {self.id}"