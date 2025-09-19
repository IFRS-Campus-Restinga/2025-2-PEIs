from django.utils.translation import gettext_lazy as _
from django.db import models

class StatusDoPei(models.TextChoices):
    OPEN = "ABERTO", _("Aberto")
    INPROGRESS = "INPROGRESS", _("Em Andamento")
    CLOSED = "CLOSED", _("Concluído")