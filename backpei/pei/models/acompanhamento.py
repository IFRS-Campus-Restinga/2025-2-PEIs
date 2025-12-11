from django.db import models
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from pei.models.aluno import Aluno


class Acompanhamento(models.Model):
    """
    Representa um acompanhamento pedagógico oferecido ao estudante,
    permitindo que ele aceite ou recuse e registre formalmente sua decisão.
    """

    STATUS_CHOICES = [
        ("pendente", "Pendente"),
        ("aceito", "Aceito"),
        ("recusado", "Recusado"),
        ("concluido", "Concluído"),
    ]

    # Usuário alvo do acompanhamento (estudante ou responsável)
    aluno = models.ForeignKey(
        "pei.Aluno",
        on_delete=models.CASCADE,
        related_name="acompanhamentos"
    )

    # Informações básicas do acompanhamento
    titulo = models.CharField(max_length=200)
    descricao = models.TextField()

    # Status atual
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pendente"
    )

    # Controle de datas
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        novo = self.pk is None  # se não existe PK → está criando

        super().save(*args, **kwargs)

        if novo:
            # envia o email após criar
            self.enviar_email_criacao()

    def enviar_email_criacao(self):
        assunto = f"Novo acompanhamento criado: {self.titulo}"
        aceitar_url = f"{settings.BACKEND_URL}/api/acompanhamentos/{self.id}/aceitar/"
        recusar_url = f"{settings.BACKEND_URL}/api/acompanhamentos/{self.id}/recusar/"
        mensagem = (
            f"Olá {self.aluno.nome},\n\n"
            f"Um novo acompanhamento foi criado para você.\n\n"
            f"Título: {self.titulo}\n"
            f"Descrição: {self.descricao}\n\n"
            f"Qualquer dúvida, entre em contato com a instituição de ensino.\n\n"
            f"Atenciosamente,\nEquipe PEI"
        )
    
        try:
            send_mail(
                assunto,
                mensagem,
                settings.DEFAULT_FROM_EMAIL,
                recipient_list=[self.aluno.email],
                fail_silently=False,
            )

            print("E-mail de acompanhamento enviado com sucesso!")
        except Exception as e:
            print(f"Erro ao enviar e-mail de acompanhamento: {e}")

        print("ACEITAR:", aceitar_url)
        print("RECUSAR:", recusar_url)

