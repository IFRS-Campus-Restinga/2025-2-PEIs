from django.core.mail import send_mail
from django.conf import settings
from pei.models.notificacao import Notificacao
import threading
from django.utils import timezone
from datetime import timedelta
from pei.models.PEIPeriodoLetivo import PEIPeriodoLetivo

def enviar_email_em_background(assunto, mensagem, destinatarios):
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

def criar_notificacao(usuario, titulo, mensagem, enviar_email=True, tipo='geral', dados_extras=None):
    if dados_extras is None:
        dados_extras = {}

    # 1. Cria no Banco
    Notificacao.objects.create(
        usuario=usuario,
        titulo=titulo,
        mensagem=mensagem,
        tipo=tipo,
        dados_extras=dados_extras
    )

    # 2. Envia E-mail
    if enviar_email and usuario and usuario.email:
        thread = threading.Thread(
            target=enviar_email_em_background,
            args=(titulo, mensagem, [usuario.email])
        )
        thread.start()

# Função para verificar -> períodos letivos <- e gerar notificações
def verificar_periodos_e_gerar_notificacoes():
    print("--- VERIFICANDO PRAZOS ---")
    hoje = timezone.now().date()
    limite = hoje + timedelta(days=7) # Aviso com 7 dias de antecedência

    periodos = PEIPeriodoLetivo.objects.filter(data_termino__range=(hoje, limite))

    for periodo in periodos:
        try:
            aluno = periodo.pei_central.aluno
            if not aluno or not aluno.curso or not aluno.curso.coordenador:
                continue
            
            coordenador = aluno.curso.coordenador
            
            titulo = "Período letivo próximo do fim"
            mensagem = f"O período do aluno {aluno.nome} termina em {periodo.data_termino.strftime('%d/%m/%Y')}."
            
            # Evita duplicatas
            existe = Notificacao.objects.filter(
                usuario=coordenador, 
                titulo=titulo, 
                mensagem=mensagem
            ).exists()

            if not existe:
                # Injetado os dados para o clique funcionar
                # Tipo 'prazo' e ID do PEI Central para redirecionar
                criar_notificacao(
                    usuario=coordenador, 
                    titulo=titulo, 
                    mensagem=mensagem, 
                    tipo='prazo',
                    dados_extras={
                        'pei_central_id': periodo.pei_central.id,
                        'url': '/periodoLetivoPerfil' # Front vai usar isso
                    }
                )
                print(f"    ✨ Notificação criada para {coordenador.username}")

        except Exception as e:
            print(f"    ☠️ Erro ao processar período: {e}")