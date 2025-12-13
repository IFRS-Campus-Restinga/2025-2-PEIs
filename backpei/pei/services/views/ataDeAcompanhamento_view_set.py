from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import EmailMessage, send_mail
from datetime import datetime
from django.conf import settings
from ..serializers import AtaDeAcompanhamentoSerializer
from pei.models.ataDeAcompanhamento import AtaDeAcompanhamento
from ..permissions import BackendTokenPermission
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError
from rest_framework.permissions import DjangoObjectPermissions

class AtaDeAcompanhamentoViewSet(ModelViewSet):
    queryset = AtaDeAcompanhamento.objects.all()
    serializer_class = AtaDeAcompanhamentoSerializer
    permission_classes = [BackendTokenPermission, DjangoObjectPermissions]

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
