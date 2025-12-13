from rest_framework.permissions import BasePermission

class ChatPermission(BasePermission):
    """
    Permite acesso ao módulo de chat para qualquer usuário autenticado,
    ignorando permissões de objeto do Django.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
