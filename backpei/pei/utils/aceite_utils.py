import hashlib
import hmac
from django.conf import settings
from django.utils import timezone
from django.urls import reverse
from django.core.mail import EmailMessage
from datetime import datetime
import requests

def make_signature(email: str, token_base: str) -> str:
    secret = settings.SECRET_KEY or ""
    payload = (email + str(token_base) + secret).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()

def build_token(token_base, signature):
    return f"{token_base}.{signature}"

def split_token(token: str):
    if "." not in token:
        return None, None
    base, sig = token.rsplit(".", 1)
    return base, sig

def fetch_objeto_summary(objeto_url: str) -> str:
    try:
        headers = {}
        if getattr(settings, "API_TOKEN", None):
            headers["Authorization"] = f"Token {settings.API_TOKEN}"
            headers["X-Backend-Token"] = settings.API_TOKEN
        resp = requests.get(objeto_url, headers=headers, timeout=5)
        if resp.ok:
            text = resp.text
            snippet = text.strip()
            if len(snippet) > 800:
                snippet = snippet[:800] + "..."
            return snippet
    except Exception:
        pass
    return ""

def send_aceite_email(destino_email: str, token: str, objeto_url: str, resumo: str, assunto_custom: str = None):
    base_link = getattr(settings, "SITE_BASE_URL", "http://localhost:8000")
    link = f"{base_link}/services/aceite/{token}/"

    assunto = assunto_custom or "Pedido de aceite eletrônico"
    corpo = f"Você foi convidado a registrar aceite sobre o recurso:\n{objeto_url}\n\nResumo (trecho):\n{resumo}\n\nClique no link abaixo para confirmar o aceite:\n{link}\n\nObservação: este aceite será gravado de forma definitiva no sistema."
    email = EmailMessage(subject=assunto, body=corpo, from_email=settings.DEFAULT_FROM_EMAIL, to=[destino_email])
    email.send(fail_silently=False)