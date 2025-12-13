from django.conf import settings
import threading
# Importações necessárias para autenticação
from rest_framework.authentication import TokenAuthentication 
from django.contrib.auth import get_user_model

User = get_user_model()

# Armazenamento local da thread (variável global mágica)
_thread_locals = threading.local()

def get_current_user():
    """Função pública para pegar o usuário de qualquer lugar do sistema"""
    return getattr(_thread_locals, 'user', None)

class CurrentUserMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # 1. Tenta autenticar o usuário via Token
        user = getattr(request, 'user', None)

        if not user or not user.is_authenticated:
            try:
                # Tenta autenticar o usuário pelo Token de Autenticação do DRF
                auth_result = TokenAuthentication().authenticate(request)
                if auth_result:
                    user, _ = auth_result
            except Exception:
                # Se o token for inválido, segue como anônimo
                pass

        # 2. Salva o usuário (logado ou anônimo) na thread
        _thread_locals.user = user
        
        return self.get_response(request)

class AddBackendTokenHeaderMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        origin = request.META.get("HTTP_ORIGIN", "")
        # apenas injeta o token se a requisição veio do react (localhost:5173)
        if origin == "http://localhost:5173":
            request.META['HTTP_X_BACKEND_TOKEN'] = settings.API_TOKEN
        return self.get_response(request)