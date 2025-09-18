from .base_model import BaseModel
from django.db import models
from django.core.validators import MinLengthValidator, MaxLengthValidator, MinValueValidator, MaxValueValidator

class DocumentacaoComplementar(BaseModel):
    autor = models.CharField(
        max_length=100,
        validators=[MinLengthValidator(5), MaxLengthValidator(100)], )
    tipo = models.CharField(
        max_length=100,
        validators=[MinLengthValidator(5), MaxLengthValidator(100)], )
    caminho = models.CharField(
        max_length=255,
        validators=[MinLengthValidator(5), MaxLengthValidator(255)], )
    
    def __str__(self):
        return f"Documentação complementar - {self.id}"