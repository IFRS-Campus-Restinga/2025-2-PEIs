from rest_framework.permissions import BasePermission
from django.conf import settings

class BackendTokenPermission(BasePermission):
    message = "Você não tem permissão para executar essa ação."

    def has_permission(self, request, view):
        # ✅ 1. Usuário logado (Guardian / Django Auth)
        if request.user and request.user.is_authenticated:
            return True

        # ✅ 2. Token de backend (serviços)
        token = request.headers.get("X-Backend-Token")

        if not token:
            return False

        return token == settings.BACKEND_TOKEN
