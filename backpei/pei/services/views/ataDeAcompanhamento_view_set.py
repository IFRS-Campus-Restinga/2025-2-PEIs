from rest_framework import viewsets, status
from rest_framework.response import Response
from django.utils.timezone import make_aware
from django.utils import timezone
from django.conf import settings
from zoneinfo import ZoneInfo
from datetime import datetime
from pei.models.ataDeAcompanhamento import AtaDeAcompanhamento
from pei.models.aceite_eletronico import AceiteEletronico
from ..serializers import AtaDeAcompanhamentoSerializer
from pei.utils.ics_utils import build_ics_and_send
from .manda_email import send_cancellation_email
from pei.utils.aceite_utils import (make_signature,send_aceite_email)
import uuid
import logging

# confirma timezone
TZ = ZoneInfo(settings.TIME_ZONE)

class AtaDeAcompanhamentoViewSet(viewsets.ModelViewSet):
    queryset = AtaDeAcompanhamento.objects.all()
    serializer_class = AtaDeAcompanhamentoSerializer

    # ====================== #
    # FILTRO DE VISIBILIDADE #
    # ====================== #
    def get_queryset(self):
        qs = super().get_queryset()
        user_email = self.request.headers.get("X-User-Email", "").strip().lower()
        user_group = self.request.headers.get("X-User-Group", "").strip()

        if user_group == "Admin":
            return qs

        if not user_email:
            return qs.none()

        public_qs = [obj for obj in qs if not obj.emails_autorizados and not obj.grupos_autorizados]
        email_qs = [obj for obj in qs if user_email in (obj.emails_autorizados or [])]
        group_qs = [obj for obj in qs if user_group in (obj.grupos_autorizados or [])]
        author_qs = [obj for obj in qs if obj.autor == user_email]

        result = set(public_qs) | set(email_qs) | set(group_qs) | set(author_qs)
        return list(result)

    def get_object(self):
        obj = AtaDeAcompanhamento.objects.get(pk=self.kwargs["pk"])
        qs = self.get_queryset()
        if obj not in qs:
            raise PermissionDenied("Você não tem permissão para acessar esta reunião.")

        return obj


    # ==================== #
    # UTILITARIOS INTERNOS #
    # ==================== #
    def _parse_datetime(self, s):
        if not s:
            return None
        dt = datetime.fromisoformat(s.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = make_aware(dt, TZ)
        return dt

    def _parse_participantes(self, raw_text):
        
        if not raw_text:
            return []
        items = [i.strip().lower() for i in raw_text.split(",")]
        return [i for i in items if i]


    # ============= #
    # METODO CREATE #
    # ============= #
    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        autor = request.headers.get("X-User-Email", "").strip().lower()
        data["autor"] = autor
        participantes_raw = data.get("participantes", "")
        participantes_emails = self._parse_participantes(participantes_raw)
        data["participantes_emails"] = participantes_emails
        emails_autorizados = set(participantes_emails)
        emails_autorizados.add(autor)
        data["emails_autorizados"] = list(emails_autorizados)
        if autor and autor not in participantes_emails:
            participantes_emails.append(autor)
            data["participantes"] = data.get("participantes", "") + f", {autor}"
        grupos_front = data.get("grupos_autorizados", [])
        if isinstance(grupos_front, str):
            grupos_front = [grupos_front]
        grupos_autorizados = set(grupos_front)
        grupos_autorizados.add("Admin")
        data["grupos_autorizados"] = list(grupos_autorizados)
        inicio = self._parse_datetime(data.get("data_inicio"))
        fim = self._parse_datetime(data.get("data_fim"))
        data["data_inicio"] = inicio
        data["data_fim"] = fim
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()

        build_ics_and_send(instance, participantes_emails)

        return Response(
            self.get_serializer(instance).data,
            status=status.HTTP_201_CREATED )


    # ============= #
    # METODO UPDATE #
    # ============= #
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance: AtaDeAcompanhamento = self.get_object()
        old_participantes = set(instance.participantes_emails or [])

        data = request.data.copy()

        if "participantes" in data:
            participantes_raw = data.get("participantes", "")
            participantes_emails = self._parse_participantes(participantes_raw)
            data["participantes_emails"] = participantes_emails
        elif "participantes_emails" in data:
            participantes_emails = data.get("participantes_emails") or []
        else:
            participantes_emails = list(instance.participantes_emails or [])

        autor = instance.autor
        emails_autorizados = set(participantes_emails)
        if autor:
            emails_autorizados.add(autor)
        data["emails_autorizados"] = list(emails_autorizados)

        if autor and autor not in participantes_emails:
            participantes_emails.append(autor)
            if "participantes" in data:
                data["participantes"] = data.get("participantes", "") + f", {autor}"

        if "dataReuniao" in data or "dataInicio" in data or "data_inicio" in data or "data_reuniao" in data:
            dt = self._parse_datetime(data.get("dataReuniao") or data.get("data_inicio") or data.get("dataInicio"))
            data["dataReuniao"] = dt
        if "dataFim" in data or "dataFim" in data or "data_fim" in data:
            dt = self._parse_datetime(data.get("dataFim") or data.get("data_fim"))
            data["dataFim"] = dt

        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()

        removed = old_participantes - set(participantes_emails)
        if removed:
            send_cancellation_email(updated, list(removed))

        added = set(participantes_emails) - old_participantes
        if added:
            build_ics_and_send(updated, list(added))

        if instance.ata_texto != updated.ata_texto and updated.ata_texto and updated.ata_texto.strip():
            self._generate_aceites(updated)

        return Response(self.get_serializer(updated).data)

    # ======= #
    # DESTROY #
    # ======= #
    def destroy(self, request, *args, **kwargs):
        instance: AtaDeAcompanhamento = self.get_object()
        return super().destroy(request, *args, **kwargs)

    # ================== #
    # GERACAO DE ACEITES #
    # ================== #
    def _generate_aceites(self, instance: AtaDeAcompanhamento):
        texto_ata = instance.ata_texto or ""
        objeto_url = f"/services/aceite/?objeto_url=/api/ataDeAcompanhamento/{instance.id}/"

        for email in (instance.participantes_emails or []):
            try:
                token_base = uuid.uuid4()
                signature = make_signature(email, token_base)
                token = f"{token_base}.{signature}"

                AceiteEletronico.objects.create(
                    email_destinatario=email,
                    token_base=token_base,
                    token_hash=signature,
                    objeto_url=f"/api/ataDeAcompanhamento/{instance.id}/",
                    enviado_em=timezone.now(),
                    extra={},
                    ativo=True
                )

                send_aceite_email(
                    destino_email=email,
                    token=token,
                    objeto_url=f"/api/ataDeAcompanhamento/{instance.id}/",
                    resumo=texto_ata,
                    assunto_custom=f"Ata disponível para aceite: {instance.tituloReuniao or instance.descricao}"
                )
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.exception(f"Falha ao gerar/enviar aceite para {email}: {e}")