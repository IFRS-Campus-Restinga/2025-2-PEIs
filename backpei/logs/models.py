from django.db import models

class Log(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    #usuario = models.CharField(max_length=100, blank=True, null=True)  # Futuro: registrar usuário
    acao = models.CharField(max_length=100)  # Apenas a ação: "Criação", "Atualização", "Exclusão"
    modelo = models.CharField(max_length=100)  # Modelo afetado: "CoordenadorCurso", "Disciplina", etc.
    objeto_id = models.IntegerField()  # ID do objeto que foi alterado
    detalhes_completos = models.JSONField(blank=True, null=True)  # Objeto anterior e novo

    def __str__(self):
        return f"{self.timestamp} - {self.acao} de {self.modelo}"