from django.db import models
from .base_model import BaseModel
from django.core.validators import MinLengthValidator
from ..validators.validador_texto import no_special_characters
from django.contrib.auth import get_user_model  
from django.core.exceptions import ValidationError
User = get_user_model()

class Disciplina(BaseModel):
    nome = models.CharField(
        blank=False,
        null=False,
        max_length=100,
        validators=[MinLengthValidator(1), no_special_characters]
    )

    professores = models.ManyToManyField(
        User,
        related_name="disciplinas",
        limit_choices_to={'groups__name': 'Professor'},
        blank=False  
    )

    def clean(self):
        if not self.pk or self.professores.count() == 0:
            raise ValidationError("A disciplina deve ter pelo menos um professor vinculado.")

        for prof in self.professores.all():
            if prof.categoria != "PROFESSOR":
                raise ValidationError(f"O usuário {prof.username} não é professor.")

    def __str__(self):
        return f"{self.nome}"
