from django.db import models
from .base_model import BaseModel
from django.core.validators import MinLengthValidator
from ..validators.validador_texto import no_special_characters


class Disciplina(BaseModel):
    nome = models.CharField(
        blank=False, null=False,
        max_length=100,
        validators=[MinLengthValidator(1), no_special_characters]
    )

    def __str__(self):
        return f'{self.nome}'
