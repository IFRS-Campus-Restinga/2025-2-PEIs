from django.conf import settings
import threading
from rest_framework.authentication import TokenAuthentication

_thread_locals = threading.local()

def get_current_user():
    """Função pública para pegar o usuário de qualquer lugar"""
    return getattr(_thread_locals, 'user', None)

class CurrentUserMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
            # 1. Tenta pegar o usuário padrão (Sessão)
            user = getattr(request, 'user', None)

            # 2. Se não estiver autenticado, tenta autenticar via Token do DRF manualmente
            if not user or not user.is_authenticated:
                try:
                    # O método authenticate retorna uma tupla (user, token) ou None
                    auth_result = TokenAuthentication().authenticate(request)
                    if auth_result:
                        user, _ = auth_result
                except Exception:
                    # Se o token for inválido ou der erro, segue como anônimo
                    pass

            # 3. Salva o usuário (logado ou anônimo) na thread para o Log usar
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