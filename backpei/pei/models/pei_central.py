from .base_model import BaseModel
from django.db import models
from django.core.validators import MinLengthValidator
from ..enums import StatusDoPei

class PeiCentral(BaseModel):
    historico_do_aluno = models.TextField(
        blank = False, 
        null = False,
        validators = [MinLengthValidator(200)],
        help_text= "Histórico do aluno",
        verbose_name= "Histórico Escolar",
    )

    necessidades_educacionais_especificas = models.TextField(
        blank = False, 
        null = False,
        validators = [MinLengthValidator(50)],
        help_text= "Detalhar as condições do estudante o que ele necessita. Ex: Se o estudante é cego: sua condição é: cegueira. Precisa de: Braille, Leitor de telas...",
        verbose_name= "Necessidades Educacionais Especificas",
    )

    habilidades = models.TextField (
        blank = False,
        null = False,
        validators = [MinLengthValidator(50)],
        help_text = "Conhecimentos, Habilidades, Capacidades, Interesses, Necessidades (O que sabe? Do que gosta/afinidades?...)",
        verbose_name = "Afinidades (habilidades, conhecimentos ...)",
    )

    dificuldades_apresentadas = models.TextField(
        blank = False,
        null = False,
        validators = [MinLengthValidator(30)],
        help_text = "Dificuldades apresentadas",
        verbose_name = "Dificuldades apresentadas",
    )

    adaptacoes = models.TextField(
        blank = True, #Campo opicional conforme normativa PEI.
        null = False,
        help_text = "Adaptações Razoáveis e/ou Acessibilidades Curriculares",
        verbose_name = "Adaptações Razoáveis e/ou Acessibilidades Curriculares",
    )

    status_pei = models.CharField(
        blank = False,
        null = False, 
        max_length = 15,
        choices = StatusDoPei,
        help_text = "Status Atual",
        verbose_name = "Status",
    )

    """COMENTÁRIO PRA MUDAR O BRANCH    """

    def __str__(self):
        return f"{self.historico_do_aluno}, {self.necessidades_educacionais_especificas}, {self.habilidades}, {self.dificuldades_apresentadas}, {self.adaptacoes}, {self.status_pei}"