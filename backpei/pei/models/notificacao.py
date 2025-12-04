from .base_model import BaseModel
from django.db import models
from django.conf import settings # Importante para pegar o modelo de usuário padrão

class Notificacao(BaseModel):
    titulo = models.CharField(max_length=255)
    mensagem = models.TextField()
    data_criacao = models.DateTimeField(auto_now_add=True)
    lida = models.BooleanField(default=False)
    tipo = models.CharField(max_length=50, default='geral')
    dados_extras = models.JSONField(default=dict, blank=True)
    
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, # on_delete=models.CASCADE: se o usuário for deletado, as notificações somem.
        related_name="notificacoes",
        blank=True
    )

    def __str__(self):
        destinatario = self.usuario.username if self.usuario else "Geral"
        return f"[{destinatario}] {self.titulo} ({self.tipo})"