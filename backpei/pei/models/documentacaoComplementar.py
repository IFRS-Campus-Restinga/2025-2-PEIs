from django.db import models
from django.core.validators import MinLengthValidator, FileExtensionValidator
from .base_model import BaseModel
from ..validators.validador_texto import no_special_characters
from ..managers.arquivo import validate_file_size  # usa a mesma função de validação do Curso
from django.contrib.auth import get_user_model
from pei.models.aluno import Aluno
import os

User = get_user_model()

def upload_documento_aluno(instance, filename):
        aluno_id = instance.aluno.id

        return os.path.join(
            'documentos',
            f'aluno_{aluno_id}',
            filename
        )

class DocumentacaoComplementar(BaseModel):
    nomeArquivo = models.CharField(
        null=False, blank=False,
        max_length=50,
        validators=[MinLengthValidator(1), no_special_characters],
        help_text='Nome para organização do arquivo'
    )

    arquivo = models.FileField(
        upload_to=upload_documento_aluno,
        validators=[
            FileExtensionValidator(allowed_extensions=['pdf', 'docx', 'png', 'jpg']),
            validate_file_size
        ],
        null=True,
        blank=True
    )

    usuario = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='documentacao',
        null=False, blank=False,
        help_text='Usuário que está inserindo documento'
    )

    aluno = models.ForeignKey(
        Aluno,
        on_delete=models.CASCADE,
        related_name='documentos',
    )

    
    def __str__(self):
        return f"Documentação complementar - {self.usuario} -> {self.aluno}"
    
