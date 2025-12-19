from .base_model import BaseModel
from django.db import models
from .usuario import Usuario
from .aluno import Aluno
from django.core.validators import MinLengthValidator, FileExtensionValidator
from .disciplina import Disciplina
from .CustomUser import CustomUser
from .aluno import Aluno



class RegistroAcompanhamento(BaseModel):

    professor = models.ForeignKey(CustomUser, on_delete=models.RESTRICT, null=False, blank=False)

    disciplina = models.ForeignKey(Disciplina, on_delete=models.RESTRICT, null=False, blank=False)

    aluno = models.ForeignKey(Aluno, on_delete=models.CASCADE, null=False, blank=False)

    email = models.EmailField(unique=True, null=False, blank=False)

    finalidade = models.CharField(null=False, blank=False)

    data = models.DateTimeField(null=False, blank=False)

    area_destaque = models.CharField(null=False, blank=False)

    indicadores_observados = models.TextField(max_length=1000, validators = [MinLengthValidator(20)], null=False, blank=False)

    interesses_potencialidades = models.TextField(max_length=800, validators = [MinLengthValidator(10)], null=False, blank=False)

    estrategias_enriquecimento = models.TextField(max_length=2000, validators = [MinLengthValidator(20)], null=False, blank=False)

    anexos = models.FileField(
        validators=[
            FileExtensionValidator(allowed_extensions=['pdf', 'docx', 'png', 'jpg'])],
        null=True,
        blank=True
    )

    parecer = models.TextField(max_length=500, validators = [MinLengthValidator(10)], null=False, blank=False)


    