from django.db import models

class Log(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    # usuario = models.CharField(max_length=100, blank=True, null=True)  # Futuro: registrar usuário
    acao = models.CharField(max_length=100)
    detalhes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.timestamp} - {self.acao}"