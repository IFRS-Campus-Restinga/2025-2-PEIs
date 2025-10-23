from .base_model import BaseModel
from django.db import models
from django.core.validators import MinLengthValidator, MaxLengthValidator, MinValueValidator, MaxValueValidator


class Parecer(BaseModel):
    componente_curricular = models.ForeignKey(
        "pei.componenteCurricular",
        on_delete=models.CASCADE,  
        related_name="pareceres"   
    )
    professor = models.ForeignKey(   
        "pei.Professor",
        on_delete=models.CASCADE,
        related_name="pareceres"
    )
    texto = models.TextField(
        #validators=[MaxLengthValidator(1000)], 
        help_text="Tu tem 1000 caracteres para escrever"
    )
    data = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Parecer {self.id} - {self.componente_curricular.periodo_letivo.periodo}"
