from .base_model import BaseModel
from django.db import models
from django.core.validators import MinLengthValidator, MaxLengthValidator, MinValueValidator, MaxValueValidator
from pei.enums.PeriodoLetivo import PeriodoLetivoChoice
from pei.models.parecer import Parecer
from pei.models.pei_central import PeiCentral

class PEIPeriodoLetivo(BaseModel):
    data_criacao = models.DateField(null=False, blank=False)
    data_termino = models.DateField(null=False, blank=False)
    periodo = models.CharField(
        max_length=100,
        choices=PeriodoLetivoChoice.choices,
        default=PeriodoLetivoChoice.SEMESTRE
    )
    periodo_principal = models.CharField(max_length=10, blank=True, null=True, editable=False)
    pei_central = models.ForeignKey(PeiCentral, on_delete=models.CASCADE, related_name="periodos") 


    def __str__(self):
        return f"{self.periodo} - {self.data_criacao}"

    @property
    def periodo_formatado(self):
        ano_inicio = self.data_criacao.year
        mes_inicio = self.data_criacao.month

        if self.periodo == PeriodoLetivoChoice.SEMESTRE:
            semestre = 1 if mes_inicio <= 6 else 2
            return f"{ano_inicio}/{semestre}"

        elif self.periodo == PeriodoLetivoChoice.BIMESTRE:
            bimestre = ((mes_inicio - 1) // 2) + 1
            return f"{ano_inicio}/{bimestre}"

        elif self.periodo == PeriodoLetivoChoice.TRIMESTRE:
            trimestre = ((mes_inicio - 1) // 3) + 1
            return f"{ano_inicio}/{trimestre}"

        else:
            return f"{ano_inicio}/?"
        

    def save(self, *args, **kwargs):
        self.periodo_principal = self.periodo_formatado
        super().save(*args, **kwargs)



