from django.db import models
from django.core.validators import MinLengthValidator, MaxLengthValidator, FileExtensionValidator
from .base_model import BaseModel
from ..validators.validador_texto import no_special_characters
from ..managers.arquivo import validate_file_size  # usa a mesma função de validação do Curso


class DocumentacaoComplementar(BaseModel):
    autor = models.CharField(
        max_length=100,
        validators=[
            MinLengthValidator(5),
            MaxLengthValidator(100),
            no_special_characters
        ]
    )

    tipo = models.CharField(
        max_length=100,
        validators=[
            MinLengthValidator(5),
            MaxLengthValidator(100)
        ]
    )

    arquivo = models.FileField(
        upload_to='documentacoes/',  # pasta dentro de MEDIA_ROOT
        validators=[
            FileExtensionValidator(allowed_extensions=['pdf', 'docx', 'png', 'jpg']),
            validate_file_size
        ],
        null=True,
        blank=True
    )

    def __str__(self):
        return f"Documentação complementar - {self.autor} ({self.tipo})"