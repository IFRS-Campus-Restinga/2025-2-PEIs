from django.utils.translation import gettext_lazy as _
from django.db import models

class CategoriaUsuario(models.TextChoices):
    ADMIN = "ADMIN", _("Administrador do Sistema")
    NAPNE = "NAPNE", _("NAPNE")
    PROFESSOR = "PROFESSOR", _("Professor")
    COORDENADOR = "COORDENADOR", _("Coordenador")
    PEDAGOGO = "PEDAGOGO", _("Pedagogo")