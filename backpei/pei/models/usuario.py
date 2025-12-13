from .base_model import BaseModel
from django.db import models
from django.core.validators import MinLengthValidator, MaxLengthValidator
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.db.models.signals import post_save
from django.dispatch import receiver

from ..enums import CategoriaUsuario


def validar_email_institucional(value):
    if not value.endswith('ifrs.edu.br'):
        raise ValidationError('O e-mail deve ser institucional (@...ifrs.edu.br)')


UserModel = get_user_model()


class Usuario(BaseModel):
    STATUS_PENDENTE = 'PENDING'
    STATUS_APROVADO = 'APPROVED'
    STATUS_REJEITADO = 'REJECTED'

    STATUS_CHOICES = [
        (STATUS_PENDENTE, 'Pendente'),
        (STATUS_APROVADO, 'Aprovado'),
        (STATUS_REJEITADO, 'Rejeitado'),
    ]

    user = models.OneToOneField(
        UserModel,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="perfil_usuario"
    )

    nome = models.CharField(
        max_length=100,
        validators=[MinLengthValidator(10), MaxLengthValidator(100)]
    )

    email = models.EmailField(
        unique=True,
        validators=[
            validar_email_institucional,
            MinLengthValidator(10),
            MaxLengthValidator(100)
        ]
    )

    categoria = models.CharField(
        max_length=20,
        choices=CategoriaUsuario.choices,
        default=CategoriaUsuario.PROFESSOR
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDENTE
    )

    grupos = models.ManyToManyField(Group, blank=True)

    def __str__(self):
        return f"{self.email} - {self.categoria}"


# =============================================================================
# SINAL CORRIGIDO: só ativa/desativa o auth.User existente — NUNCA cria novo!
# =============================================================================
@receiver(post_save, sender=Usuario)
def sincronizar_status_com_auth_user(sender, instance, **kwargs):
    """
    Quando o status do perfil mudar:
    - Aprovado → auth.User.is_active = True
    - Pendente/Rejeitado → auth.User.is_active = False
    """
    if not instance.user:
        # Se por algum motivo ainda não tem vínculo com auth.User, não faz nada
        return

    desejado = (instance.status == Usuario.STATUS_APROVADO)

    if instance.user.is_active != desejado:
        instance.user.is_active = desejado
        instance.user.save(update_fields=['is_active'])


# Removi completamente o outro receiver que tentava criar usuário novo
# (era ele que estava causando o erro UNIQUE constraint failed)