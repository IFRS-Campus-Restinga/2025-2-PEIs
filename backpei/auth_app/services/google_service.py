# backpei/auth_app/services/google_service.py
from django.conf import settings
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

User = get_user_model()

GOOGLE_CLIENT_ID = settings.GOOGLE_OAUTH2_CLIENT_ID

class GoogleAuthService:
    @staticmethod
    def verify_google_token(id_token_str):
        """
        Verifica o id_token recebido do cliente (Google Sign-In).
        Retorna payload com 'email', 'name', 'picture' se válido.
        Lança ValueError se inválido.
        """
        try:
            idinfo = id_token.verify_oauth2_token(
                id_token_str,
                google_requests.Request(),
                GOOGLE_CLIENT_ID
            )
            # idinfo contém 'email', 'name', 'picture', 'email_verified', ...
            if not idinfo.get("email_verified", False):
                raise ValueError("Email do Google não verificado")
            return {
                "email": idinfo.get("email"),
                "name": idinfo.get("name") or idinfo.get("given_name"),
                "picture": idinfo.get("picture")
            }
        except Exception as e:
            raise ValueError(f"Google token inválido: {e}")

    @staticmethod
    def get_or_create_token_for_user(user):
        token, _ = Token.objects.get_or_create(user=user)
        return token.key
