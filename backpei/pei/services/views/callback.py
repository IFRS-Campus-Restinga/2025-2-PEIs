# views/auth_views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
import requests
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
import jwt

class google_callback(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        code = request.GET.get('code')
        if not code:
            return Response({"error": "Código não recebido"}, status=400)

        # Troca o code por tokens
        token_response = requests.post("https://oauth2.googleapis.com/token", data={
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        })
        tokens = token_response.json()

        if "error" in tokens:
            return Response({"error": tokens.get("error_description", "Erro no Google")}, status=400)

        # Pega email do id_token
        
        id_token = tokens.get("id_token")
        payload = jwt.decode(id_token, options={"verify_signature": False})
        email = payload["email"]

        # Cria usuário no Django
        User = get_user_model()
        user, _ = User.objects.get_or_create(email=email, defaults={"username": email})
        token, _ = Token.objects.get_or_create(user=user)

        # Salva refresh_token na sessão
        request.session['google_refresh_token'] = tokens['refresh_token']

        # Redireciona de volta pro React (ou retorna JSON)
        return Response({
            "message": "Login OK",
            "django_token": token.key,
            "redirect_to": "http://localhost:5173/dashboard"  # opcional
        })