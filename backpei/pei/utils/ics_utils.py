from django.conf import settings
from django.core.mail import EmailMessage
from datetime import datetime
from zoneinfo import ZoneInfo

TZ = ZoneInfo(settings.TIME_ZONE)
def _dt_to_utc_str(dt):
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=TZ)
    dt_utc = dt.astimezone(ZoneInfo("UTC"))
    return dt_utc.strftime("%Y%m%dT%H%M%SZ")

def build_ics(instance, destino_emails):
    dtstart = _dt_to_utc_str(instance.dataReuniao)
    dtend = _dt_to_utc_str(instance.dataFim)

    ics = f"""BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:{instance.id}@SistemaPEI
DTSTAMP:{_dt_to_utc_str(datetime.now(TZ))}
DTSTART:{dtstart}
DTEND:{dtend}
SUMMARY:{instance.tituloReuniao}
LOCATION:{instance.local or ""}
DESCRIPTION:{instance.tituloReuniao or ""}
END:VEVENT
END:VCALENDAR
"""
    return ics

def build_ics_and_send(instance, destino_emails):
    ics = build_ics(instance, destino_emails)
    email = EmailMessage(
        subject=f"Convite: {instance.tituloReuniao}",
        body="Você recebeu uma convocação de reunião marcada através do sistema IFRS PEI.",
        to=destino_emails )
    email.attach("convite.ics", ics, "text/calendar")
    email.send(fail_silently=False)