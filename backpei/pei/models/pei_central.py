from .base_model import BaseModel
from django.db import models
from django.core.validators import MinLengthValidator
from ..enums import StatusDoPei
from .aluno import Aluno
from django.core.exceptions import ValidationError as Erro
from rest_framework.exceptions import ValidationError

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

    aluno = models.ForeignKey(
        Aluno, 
        related_name="aluno", 
        on_delete=models.CASCADE
    )

    def clean(self):
        pei = PeiCentral.objects.filter(
                aluno = self.aluno
            ).exclude(
                id = self.id
            ).filter(
                status_pei__in=['ABERTO', 'EM ANDAMENTO', 'INATIVO']
            )
        if pei.exists(): #valida se existe uma correspondência ao menos do filtro realizado acima
            raise Erro(
                f"O Aluno {self.aluno} já possui um PEI ativo, conclua ou feche o PEI existente para abrir umm novo."
            )
        
    def save(self, *args, **kwargs):
        try:
            self.clean()
        except Erro as e:
            raise ValidationError(e.message or e.messages)
                                     
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.aluno}, {self.status_pei}"