from django.db import models
from .base_model import BaseModel
from ..enums.nivel import Nivel
from django.core.validators import MinLengthValidator, FileExtensionValidator
<<<<<<< HEAD
from .coordenadorCurso import CoordenadorCurso
from ..managers.arquivo import validate_file_size
from ..validators.validador_texto import no_special_characters

class Curso(BaseModel):
    name = models.CharField(
        max_length=100,
        validators=[MinLengthValidator(1), no_special_characters]
=======
from .coordenador_curso import CoordenadorCurso
from ..managers.arquivo import validate_file_size

class Curso(BaseModel):
    name = models.CharField(
        blank=False, null=False,
        max_length=100,
        validators=[MinLengthValidator(1)]
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d
    )
    nivel = models.CharField(
        max_length=100,
<<<<<<< HEAD
        choices=Nivel,
        default=Nivel.NOT_INFORMED,
        validators=[MinLengthValidator(1)]
=======
        validators=[MinLengthValidator(1)],
        choices=Nivel,
        default=Nivel.NOT_INFORMED,
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d
    )
    disciplinas = models.ManyToManyField("Disciplina", related_name="cursos", blank=True)
    coordenador = models.ForeignKey(CoordenadorCurso, on_delete=models.RESTRICT, related_name="coordenador")
    arquivo = models.FileField(
<<<<<<< HEAD
        upload_to='cursos/',  # pasta dentro de MEDIA_ROOT
=======
        upload_to="cursos_arquivos/",
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d
        validators=[
            FileExtensionValidator(allowed_extensions=['pdf', 'docx', 'png', 'jpg']),
            validate_file_size
        ],
        null=True,
        blank=True
    )

    def __str__(self):
        return f'{self.name} - {self.coordenador}'
