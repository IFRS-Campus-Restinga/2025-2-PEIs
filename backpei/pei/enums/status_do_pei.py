from django.utils.translation import gettext_lazy as _
from django.db import models

class StatusDoPei(models.TextChoices):
    OPEN = "ABERTO", _("Aberto")
    INPROGRESS = "EM ANDAMENTO", _("Em Andamento")
    CLOSED = "CONCLUÍDO", _("Concluído")
    SUSPENDED = "SUSPENSO", _("Suspenso")