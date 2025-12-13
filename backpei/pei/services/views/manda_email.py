from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.core.mail import send_mail, EmailMessage
from datetime import datetime, timedelta
from django.conf import settings
from rest_framework import status
from ..permissions import BackendTokenPermission
from pei.utils.notificacoes_utils import verificar_periodos_e_gerar_notificacoes


# ====================================
# FUNCAO ORIGINAL QUE MANDA EMAILS # =
# ====================================
@api_view(['POST'])
# utiliza o nosso permission do token
@permission_classes([BackendTokenPermission])
def manda_email(request):
    data = request.data
    destino = data.get("destino")
    assunto = data.get("assunto")
    texto = data.get("texto")
    verificar_periodos_e_gerar_notificacoes()
    if not destino or not assunto or not texto:
        return Response({"erro": "campos destino, assunto e texto precisam existir"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        send_mail(
            subject=assunto,
            message=texto,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[destino],
            fail_silently=False,
        )
        return Response({"status": "ok", "message": "Email enviado"}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"erro": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =============================================
# FUNCAO NOVA QUE MANDA CONVITES DE REUNIAO # =
# =============================================
@api_view(['POST'])
@permission_classes([BackendTokenPermission])
def enviar_convite_reuniao(request):
    data = request.data
    destinos = data.get("destinos", [])
    if isinstance(destinos, str):
        destinos = [destinos]
    attendees_str = ""
    for d in destinos:
        attendees_str += f"ATTENDEE;CN=Convidado:mailto:{d}\n"
    assunto = data.get("assunto")
    descricao = data.get("descricao", "")
    meet_link = "https://meet.google.com/new"
    descricao += f"\n\nLink da reunião: {meet_link}"
    # formato ISO 2024-03-10T14:00
    inicio = data.get("inicio")
    # formato ISO
    fim = data.get("fim")
    verificar_periodos_e_gerar_notificacoes()

    # validacao de campos obrigatorios
    if not destinos or not assunto or not inicio or not fim:
        return Response({"erro": "Os campos de destinos, assunto, inicio e fim são obrigatórios"}, status=400)

    # faz parse das datas
    dt_inicio = datetime.fromisoformat(inicio)
    dt_fim = datetime.fromisoformat(fim)

    # formatando em padrao UTC para o ICS
    dt_inicio_str = dt_inicio.strftime("%Y%m%dT%H%M%S")
    dt_fim_str = dt_fim.strftime("%Y%m%dT%H%M%S")
    dt_criado_str = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")

    # conteudo do ICS, o anexo que vai ser interpretado como reuniao
    ics_conteudo = f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SeuSistema//PT-BR
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:{dt_criado_str}@ifrspei
DTSTAMP:{dt_criado_str}
DTSTART:{dt_inicio_str}
DTEND:{dt_fim_str}
SUMMARY:{assunto}
DESCRIPTION:{descricao}
ORGANIZER;CN=Sistema PEI:mailto:{settings.DEFAULT_FROM_EMAIL}
{attendees_str.strip()}
END:VEVENT
END:VCALENDAR
"""

    # criando email com anexo ICS
    email = EmailMessage(
        subject=assunto,
        body="Você recebeu um convite de reunião pelo sistema PEI.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=destinos
    )
    email.attach("convite.ics", ics_conteudo, "text/calendar")

    try:
        email.send()
        return Response({"status": "ok", "message": "Convite enviado"}, status=200)
    except Exception as e:
        return Response({"erro": str(e)}, status=500)


# ==============================
# FUNCAO QUE CANCELA REUNIAO # =
# ==============================
def send_cancellation_email(instance, destinos):
    msg = EmailMessage(
        subject=f"Reunião cancelada: {instance.tituloReuniao}",
        body="A reunião foi cancelada pelo organizador.",
        to=destinos,
    )
    msg.send(fail_silently=False)