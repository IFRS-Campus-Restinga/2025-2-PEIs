from .base_model import BaseModel
from django.db import models
from django.core.validators import MinLengthValidator, MaxLengthValidator, MinValueValidator, MaxValueValidator
from pei.enums.periodo_letivo import PeriodoLetivoChoice
from pei.models.parecer import Parecer
from .pei_central import PeiCentral


class PEIPeriodoLetivo(BaseModel):
    data_criacao = models.DateField(null=False, blank=False)
    periodo = models.CharField(
        max_length=100,
        choices=PeriodoLetivoChoice.choices,
        default=PeriodoLetivoChoice.SEMESTRE
    )

    #Criando relacionamento um para muitos com o PeiCentral
    pei_central = models.ForeignKey(PeiCentral, on_delete=models.CASCADE, related_name="periodos")

    def __str__(self):
        return f"{self.periodo} - {self.data_criacao}"

