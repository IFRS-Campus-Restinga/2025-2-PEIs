from .base_model import BaseModel
from django.db import models
from django.core.validators import MinLengthValidator, MaxLengthValidator
from ..validators.validador_texto import no_special_characters

class CoordenadorCurso(BaseModel):
    nome = models.CharField(
        max_length=100,
        validators=[MinLengthValidator(7), MaxLengthValidator(60), no_special_characters])
    

    
    def __str__(self):
        return f"{self.nome}"
