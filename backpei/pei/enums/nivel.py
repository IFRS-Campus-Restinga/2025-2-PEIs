from django.db import models

class Nivel(models.TextChoices):
    SUPERIOR = "SUP", "Superior"
    MEDIO = "MED", "Médio"
    TECNICO = "TEC", "Técnico"