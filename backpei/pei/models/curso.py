from django.db import models
from .base_model import BaseModel
from ..enums.nivel import Nivel
from django.core.validators import MinLengthValidator, FileExtensionValidator
from .coordenadorCurso import CoordenadorCurso
from ..managers.arquivo import validate_file_size
from ..validators.validador_texto import no_special_characters

class Curso(BaseModel):
    nome = models.CharField(
        max_length=100,
        validators=[MinLengthValidator(1), no_special_characters]
    )
    nivel = models.CharField(
        max_length=100,
        choices=Nivel,
        default=Nivel.NOT_INFORMED,
        validators=[MinLengthValidator(1)]
    )
    disciplinas = models.ManyToManyField("Disciplina", related_name="cursos", blank=True)
    coordenador = models.ForeignKey(CoordenadorCurso, on_delete=models.RESTRICT, related_name="coordenador")
    arquivo = models.FileField(
        upload_to='cursos/',  # pasta dentro de MEDIA_ROOT
        validators=[
            FileExtensionValidator(allowed_extensions=['pdf', 'docx', 'png', 'jpg']),
            validate_file_size
        ],
        null=True,
        blank=True
    )

    def __str__(self):
        return f'{self.name} - {self.coordenador}'
