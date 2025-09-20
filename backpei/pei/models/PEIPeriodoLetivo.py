from .base_model import BaseModel
from django.db import models
from django.core.validators import MinLengthValidator, MaxLengthValidator, MinValueValidator, MaxValueValidator
from pei.enums.PeriodoLetivo import PeriodoLetivoChoice
from pei.models.parecer import Parecer


class PEIPeriodoLetivo(BaseModel):
    data_criacao = models.DateField(null=False, blank=False)
    periodo = models.CharField(
        max_length=100,
        choices=PeriodoLetivoChoice.choices,
        default=PeriodoLetivoChoice.SEMESTRE
    )

    def __str__(self):
        return f"{self.periodo} - {self.data_criacao}"

