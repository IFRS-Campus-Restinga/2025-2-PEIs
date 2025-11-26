from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from .base_model import BaseModel

User = get_user_model()


class Parecer(BaseModel):
    componente_curricular = models.ForeignKey(
        "pei.ComponenteCurricular",
        on_delete=models.CASCADE,
        related_name="pareceres"
    )

    professor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="pareceres",
        limit_choices_to={'groups__name': 'Professor'},
        help_text="Selecione apenas usuários do grupo Professor"
    )

    texto = models.TextField(
        help_text="Você tem 1000 caracteres para escrever"
    )

    data = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Parecer {self.id} - {self.componente_curricular.periodo_letivo.periodo}"

    def clean(self):
        if self.professor and not self.professor.groups.filter(name="Professor").exists():
            raise ValidationError("O usuário selecionado deve pertencer ao grupo 'Professor'.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
