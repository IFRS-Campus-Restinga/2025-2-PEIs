from .base_model import BaseModel
from django.db import models
from django.core.validators import MinLengthValidator, MaxLengthValidator, MinValueValidator, MaxValueValidator

class Pessoa(BaseModel):
    nome = models.CharField(
        max_length=100,
        validators=[MinLengthValidator(7), MaxLengthValidator(100)], )
    categoria = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(3)], )
    
def __str__(self):
        return f"{self.nome}"