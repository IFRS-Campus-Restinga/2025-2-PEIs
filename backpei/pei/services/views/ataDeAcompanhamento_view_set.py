from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import EmailMessage, send_mail
from datetime import datetime
from django.conf import settings
from ..serializers import AtaDeAcompanhamentoSerializer
from pei.models.ataDeAcompanhamento import AtaDeAcompanhamento
from ..permissions import BackendTokenPermission

def build_ics_and_send(subject, description, inicio_dt, fim_dt, organizer_email, destinos, filename="convite.ics"):
    # formata como YYYYMMDDTHHMMSS (sem timezone)
    dt_inicio_str = inicio_dt.strftime("%Y%m%dT%H%M%S")
    dt_fim_str = fim_dt.strftime("%Y%m%dT%H%M%S")
    dt_criado_str = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")

    # monta attendees
    attendees_str = ""
    for d in destinos:
        attendees_str += f"ATTENDEE;CN=Convidado:mailto:{d}\n"

    ics_conteudo = f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SeuSistema//PT-BR
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:{dt_criado_str}@{organizer_email}
DTSTAMP:{dt_criado_str}
DTSTART:{dt_inicio_str}
DTEND:{dt_fim_str}
SUMMARY:{subject}
DESCRIPTION:{description}
ORGANIZER;CN=Sistema PEI:mailto:{organizer_email}
{attendees_str.strip()}
END:VEVENT
END:VCALENDAR
"""

    email = EmailMessage(
        subject=subject,
        body="Você recebeu um convite de reunião pelo sistema PEI.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=destinos
    )
    email.attach(filename, ics_conteudo, "text/calendar")
    email.send()


class AtaDeAcompanhamentoViewSet(ModelViewSet):
    queryset = AtaDeAcompanhamento.objects.all()
    serializer_class = AtaDeAcompanhamentoSerializer
    permission_classes = [BackendTokenPermission]
    lookup_field = "id"

    def parse_participants(self, participantes_field, participantes_emails_field=None):
        emails = []
        if participantes_emails_field:
            emails = [e.strip() for e in participantes_emails_field if isinstance(e, str) and e.strip()]
        if participantes_field:
            parts = [p.strip() for p in participantes_field.split(",")]
            parts = [p for p in parts if p]
            emails.extend(parts)
        seen = set()
        result = []
        for e in emails:
            if e not in seen:
                seen.add(e)
                result.append(e)
        return result

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        # preenche ator a partir do header
        ator_email = request.headers.get("X-User-Email") or request.META.get("HTTP_X_USER_EMAIL")
        data['ator'] = ator_email or ""
        # parse participantes
        participantes_field = data.get("participantes", "")
        participantes_emails_field = data.get("participantes_emails", None)
        destinos = self.parse_participants(participantes_field, participantes_emails_field)
        # garante que o criador tambem receba o convite
        if ator_email and ator_email not in destinos:
            destinos.append(ator_email)

        inicio = data.get("dataReuniao")
        fim = data.get("dataFim")
        try:
            dt_inicio = datetime.fromisoformat(inicio)
            dt_fim = datetime.fromisoformat(fim)
        except Exception as e:
            return Response({"erro": "Formato de data inválido. Use ISO 8601."}, status=status.HTTP_400_BAD_REQUEST)

        # enviar convite antes de salvar
        assunto = data.get("descricao", "Reunião")
        descricao = data.get("descricao", "")
        try:
            build_ics_and_send(assunto, descricao, dt_inicio, dt_fim, settings.DEFAULT_FROM_EMAIL, destinos)
        except Exception as e:
            return Response({"erro": f"Erro ao enviar convite: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # salva participantes_emails no objeto
        data['participantes_emails'] = destinos

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        """
        Ao atualizar, envia um email de cancelamento da reunião anterior e depois envia novo convite.
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        old_title = instance.descricao
        old_participants = instance.participantes_emails or []
        # envia email de cancelamento para participantes antigos
        cancel_subject = f"[CANCELADA] Reunião: {old_title}"
        cancel_text = f"A reunião '{old_title}' foi alterada. Por favor desconsidere o convite anterior."
        try:
            # usa send_mail simples para aviso
            send_mail(cancel_subject, cancel_text, settings.DEFAULT_FROM_EMAIL, old_participants, fail_silently=False)
        except Exception:
            pass

        # agora procede com update normal e apos atualizar envia novo convite como em create
        data = request.data.copy()
        ator_email = request.headers.get("X-User-Email") or request.META.get("HTTP_X_USER_EMAIL")
        data['ator'] = ator_email or instance.ator or ""
        participantes_field = data.get("participantes", instance.participantes)
        participantes_emails_field = data.get("participantes_emails", instance.participantes_emails)
        destinos = self.parse_participants(participantes_field, participantes_emails_field)
        if ator_email and ator_email not in destinos:
            destinos.append(ator_email)

        inicio = data.get("dataReuniao")
        fim = data.get("dataFim")
        try:
            dt_inicio = datetime.fromisoformat(inicio)
            dt_fim = datetime.fromisoformat(fim)
        except Exception:
            return Response({"erro": "Formato de data inválido. Use ISO 8601."}, status=status.HTTP_400_BAD_REQUEST)

        # envia novo convite
        assunto = data.get("descricao", instance.descricao)
        descricao = data.get("descricao", instance.descricao)
        try:
            build_ics_and_send(assunto, descricao, dt_inicio, dt_fim, settings.DEFAULT_FROM_EMAIL, destinos)
        except Exception as e:
            return Response({"erro": f"Erro ao enviar novo convite: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        data['participantes_emails'] = destinos

        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        """
        Envia email de cancelamento antes de apagar.
        """
        instance = self.get_object()
        title = instance.descricao
        participants = instance.participantes_emails or []
        cancel_subject = f"[CANCELADA] Reunião: {title}"
        cancel_text = f"A reunião '{title}' foi cancelada. Desconsidere o convite anterior."
        try:
            send_mail(cancel_subject, cancel_text, settings.DEFAULT_FROM_EMAIL, participants, fail_silently=False)
        except Exception:
            pass

        return super().destroy(request, *args, **kwargs)
