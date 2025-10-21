from .base_model import BaseModel
from django.db import models
from django.utils import timezone

class Notificacao(BaseModel):
    titulo = models.CharField(max_length=255)
    mensagem = models.TextField()
    data_criacao = models.DateTimeField(auto_now_add=True)
    lida = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.titulo} ({'Lida' if self.lida else 'Não lida'})"