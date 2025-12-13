from django.db import models
from django.utils import timezone
import uuid
from django.db.models import JSONField
from .base_model import BaseModel

class AceiteEletronico(BaseModel):
    id = models.BigAutoField(primary_key=True)
    email_destinatario = models.CharField(max_length=254)
    objeto_url = models.TextField()
    token_base = models.UUIDField(default=uuid.uuid4, editable=False)
    token_hash = models.CharField(max_length=128, editable=False)  # sha256 hex
    enviado_em = models.DateTimeField(default=timezone.now)
    aceito_em = models.DateTimeField(null=True, blank=True)
    extra = JSONField(default=dict, blank=True)
    ativo = models.BooleanField(default=True)

    class Meta:
        db_table = "pei_aceite_eletronico"
        indexes = [
            models.Index(fields=["token_base"]),
            models.Index(fields=["email_destinatario"]),
        ]

    def __str__(self):
        return f"Aceite #{self.id} -> {self.email_destinatario} - {self.objeto_url}"