from django.db import models

class PeriodoLetivoChoice(models.TextChoices):
    BIMESTRE = "BIMESTRE", "Bimestre"
    TRIMESTRE = "TRIMESTRE", "Trimestre"
    SEMESTRE = "SEMESTRE", "Semestre"
