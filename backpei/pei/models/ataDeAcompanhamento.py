from .base_model import BaseModel
from django.db import models
from django.core.validators import MinLengthValidator, MaxLengthValidator
from django.utils import timezone
from django.core.exceptions import ValidationError

# validacao de email institucional
def validar_email_institucional(value):
    if not isinstance(value, str) or not value.endswith('ifrs.edu.br'):
        raise ValidationError('O email deve ser institucional (ifrs.edu.br)')

# validacao de data de reuniao futura
def validaDataFutura(value):
    if value < timezone.now():
        raise ValidationError("A data da reunião deve ser no futuro.")

class AtaDeAcompanhamento(BaseModel):
    dataReuniao = models.DateTimeField(validators=[validaDataFutura])
    dataFim = models.DateTimeField()
    tituloReuniao = models.CharField(max_length=150, validators=[MinLengthValidator(3), MaxLengthValidator(150)])
    local = models.CharField(max_length=300, validators=[MinLengthValidator(3), MaxLengthValidator(300)])
    autor = models.EmailField(max_length=100, validators=[validar_email_institucional, MinLengthValidator(10), MaxLengthValidator(100)])
    # guarda lista de emails em tambem em formato JSON para uso no envio/cancelamento e como lista de acesso
    participantes = models.CharField(max_length=750, validators=[MinLengthValidator(5), MaxLengthValidator(750)])
    participantes_emails = models.JSONField(default=list, blank=True)
    # campos referentes a ata
    ata_texto = models.TextField(blank=True)
    ata_criada_em = models.DateTimeField(null=True, blank=True)
    # listas de acesso
    emails_autorizados = models.JSONField(default=list, blank=True)
    grupos_autorizados = models.JSONField(default=list, blank=True)
    # controle de status
    ativo = models.BooleanField(default=True)

    def __str__(self):
        return f"Reuniao - {self.tituloReuniao} - {self.dataReuniao}"

    def clean(self):
        # chama validacoes do base model
        super_clean = getattr(super(), "clean", None)
        if callable(super_clean):
            super_clean()

        # valida data de inicio e fim
        if self.dataReuniao and self.dataFim:
            if self.dataFim <= self.dataReuniao:
                raise ValidationError({"dataFim": "A data de fim deve ser posterior a data de inicio."})

        # quando a ata for preenchida, verifica se a data seria posterior a da reuniao
        if self.ata_texto and self.dataReuniao:
            agora = timezone.now()
            if agora < self.dataReuniao:
                raise ValidationError({"ata_texto": "A ata nao pode ser registrada antes da reuniao."})
        
        # impede edicao da ata depois de criada
        if self.pk:
            old = AtaDeAcompanhamento.objects.filter(pk=self.pk).first()
            if old and old.ata_texto and self.ata_texto != old.ata_texto:
                raise ValidationError({"ata_texto": "A ata nao pode ser alterada depois de ter sido registrada."})

    def save(self, *args, **kwargs):
        # garante sempre admin nos grupos autorizados
        grupos = self.grupos_autorizados or []
        if "Admin" not in grupos:
            grupos.append("Admin")
        self.grupos_autorizados = grupos

        # se participantes_emails existirem e emails_autorizados vazio, mescla
        try:
            part_emails = list(self.participantes_emails or [])
        except Exception:
            part_emails = []
        try:
            auth_emails = list(self.emails_autorizados or [])
        except Exception:
            auth_emails = []

        # mescla sem duplicatas
        merged = []
        seen = set()
        for e in (auth_emails + part_emails):
            if isinstance(e, str):
                ee = e.strip()
                if ee and ee not in seen:
                    seen.add(ee)
                    merged.append(ee)
        self.emails_autorizados = merged

        # seta ata_criada_em apenas na primeira vez que for salvo texto de ata
        if self.ata_texto and not self.ata_criada_em:
            self.ata_criada_em = timezone.now()

        # por fim chama o save da superclasse
        super().save(*args, **kwargs)