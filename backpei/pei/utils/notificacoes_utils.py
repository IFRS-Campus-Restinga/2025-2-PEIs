from django.core.mail import send_mail
from django.conf import settings
from pei.models.notificacao import Notificacao
import threading # Para não travar o sistema enquanto envia email

def enviar_email_em_background(assunto, mensagem, destinatarios):
    """Função auxiliar para enviar e-mail sem travar a requisição"""
    try:
        send_mail(
            subject=assunto,
            message=mensagem,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=destinatarios,
            fail_silently=True,
        )
    except Exception as e:
        print(f"Erro ao enviar e-mail background: {e}")

def criar_notificacao(usuario, titulo, mensagem, enviar_email=True):
    """
    Cria uma notificação no sistema e opcionalmente envia um e-mail.
    """
    # Cria no Banco (Para o Sininho)
    Notificacao.objects.create(
        usuario=usuario,
        titulo=titulo,
        mensagem=mensagem
    )

    # Envia E-mail (se solicitado e se o usuário tiver e-mail)
    if enviar_email and usuario and usuario.email:
        # Usamos threading para o usuário não ficar esperando o Gmail responder
        thread = threading.Thread(
            target=enviar_email_em_background,
            args=(titulo, mensagem, [usuario.email])
        )
        thread.start()
        
from django.utils import timezone
from datetime import timedelta
from pei.models.PEIPeriodoLetivo import PEIPeriodoLetivo

def verificar_periodos_e_gerar_notificacoes():
    hoje = timezone.now().date()
    limite = hoje + timedelta(days=7)

    # Busca períodos terminando
    periodos = PEIPeriodoLetivo.objects.filter(data_termino__range=(hoje, limite))

    for periodo in periodos:
        try:
        # LÓGICA MELHORADA:
        # Em vez de criar notificação solta, vamos avisar o COORDENADOR do curso
        # Precisamos navegar: Periodo -> PeiCentral -> Aluno -> Curso -> Coordenador
        
        # Tentativa de chegar no coordenador (depende da sua estrutura exata)
            aluno = periodo.pei_central.aluno
            if aluno and aluno.curso and aluno.curso.coordenador:
                coordenador = aluno.curso.coordenador
                
                titulo = "Período letivo próximo do fim"
                mensagem = f"O período do aluno {aluno.nome} termina em {periodo.data_termino.strftime('%d/%m/%Y')}."

                # Evita duplicatas verificando se já existe notificação para este usuário com este título hoje
                # (Lógica simplificada, pode ser refinada)
                existe = Notificacao.objects.filter(
                    usuario=coordenador, 
                    titulo=titulo, 
                    mensagem=mensagem
                ).exists()

                if not existe:
                    criar_notificacao(coordenador, titulo, mensagem)

        except Exception as e:
            print(f"    ☠️ Erro ao processar período: {e}")

def enviar_email_acompanhamento(acompanhamento):
    aluno = acompanhamento.aluno
    email = aluno.email

    assunto = "Solicitação de Acompanhamento - PEI"

    aceitar_url = f"{settings.FRONTEND_URL}/api/acompanhamentos/{acompanhamento.id}/aceitar/"
    recusar_url = f"{settings.FRONTEND_URL}/api/acompanhamentos/{acompanhamento.id}/recusar/"

    mensagem = f"""
Olá,

Foi criado um novo acompanhamento para o aluno {aluno.nome}.

Por favor, escolha uma opção:

Aceitar acompanhamento:
{aceitar_url}

Recusar acompanhamento:
{recusar_url}

Caso não reconheça esta mensagem, entre em contato com a escola.

Atenciosamente,
PEI - Instituto Federal do Rio Grande do Sul - Campus Restinga
"""

    send_mail(
        assunto,
        mensagem,
        settings.DEFAULT_FROM_EMAIL,
        [email],
        fail_silently=False,
    )
