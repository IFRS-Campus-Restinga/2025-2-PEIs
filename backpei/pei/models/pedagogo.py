from .base_model import BaseModel
from django.db import models
from django.core.validators import MinLengthValidator, MaxLengthValidator

class Pedagogo(BaseModel):
    nome = models.CharField(
        max_length=100,
        validators=[MinLengthValidator(7), MaxLengthValidator(100)], )
    
def __str__(self):
        return f"{self.nome}"