from django.conf import settings
from rest_framework.permissions import BasePermission

class BackendTokenPermission(BasePermission):
    def has_permission(self, request, view):
        token_recebido = request.headers.get("X-BACKEND-TOKEN")
        origin = request.headers.get("Origin")
        referer = request.headers.get("Referer")

        origem_permitida = origin in settings.CORS_ALLOWED_ORIGINS or (
            referer and any(r in referer for r in settings.CORS_ALLOWED_ORIGINS)
        )

        return token_recebido == settings.API_TOKEN and origem_permitida