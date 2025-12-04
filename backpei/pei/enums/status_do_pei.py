from django.utils.translation import gettext_lazy as _
from django.db import models

class StatusDoPei(models.TextChoices):
    OPEN = "ABERTO", _("Aberto")
    INPROGRESS = "EM ANDAMENTO", _("Em Andamento")
    CLOSED = "FECHADO", _("Fechado")
    SUSPENDED = "SUSPENSO", _("Suspenso")