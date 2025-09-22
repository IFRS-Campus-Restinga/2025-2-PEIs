from django.utils.translation import gettext_lazy as _
from django.db import models

class Nivel(models.TextChoices):
    SUPERIOR = "Superior", _("Superior")
    MEDIO = "Ensino Médio", _("Ensino Medio")
    NOT_INFORMED = "Não informado", _("Não informado")