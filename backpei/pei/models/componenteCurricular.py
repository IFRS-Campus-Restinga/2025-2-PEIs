from .base_model import BaseModel
from django.db import models
from django.core.validators import MinLengthValidator, MaxLengthValidator
from ..validators.validador_texto import no_special_characters

class ComponenteCurricular(BaseModel):
    objetivos = models.CharField(
        max_length=100,
        validators=[MinLengthValidator(7), MaxLengthValidator(100), 
                    no_special_characters], 
                    blank=False, null=False)
    conteudo_prog = models.CharField(
        max_length=100,
        validators=[MinLengthValidator(1), MaxLengthValidator(3)], blank=False, null=False)
    metodologia = models.CharField(
        max_length=100,
        validators=[MinLengthValidator(7), MaxLengthValidator(255)], blank=False, null=False )
    
    disciplinas = models.ForeignKey(
        "Disciplina", 
        related_name="componentes_curriculares", 
        on_delete=models.CASCADE, 
        blank=False, 
        null=False
    )

    periodo_letivo = models.ForeignKey(
        "pei.PEIPeriodoLetivo",
        on_delete=models.CASCADE,  
        related_name="componentes_curriculares"   
    )
    
    def __str__(self):
        return f"Componente curricular - {self.id}"