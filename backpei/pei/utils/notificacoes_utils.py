from django.utils import timezone
from datetime import timedelta
from pei.models.PEIPeriodoLetivo import PEIPeriodoLetivo
from pei.models.notificacao import Notificacao

def verificar_periodos_e_gerar_notificacoes():
    hoje = timezone.now().date()
    limite = hoje + timedelta(days=7)

    # Busca períodos que terminam nos próximos 7 dias
    periodos = PEIPeriodoLetivo.objects.filter(data_termino__range=(hoje, limite))

    for periodo in periodos:
        titulo = "Período letivo próximo do fim"
        mensagem = (
            f"O período {periodo.periodo_formatado} irá terminar "
            f"em {periodo.data_termino.strftime('%d/%m/%Y')}."
        )

        # Evita criar duplicadas
        if not Notificacao.objects.filter(titulo=titulo, mensagem=mensagem).exists():
            Notificacao.objects.create(titulo=titulo, mensagem=mensagem)
