# backpei/auth_app/admin.py

from django.contrib import admin
from django.contrib.auth import get_user_model

User = get_user_model()

@admin.register(User)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ("username", "email", "categoria", "aprovado")
    readonly_fields = ("email",)
    search_fields = ("username", "email")
    list_filter = ("categoria", "aprovado", "groups")

    fieldsets = (
        ("Dados básicos", {
            "fields": ("username", "email", "first_name", "last_name", "foto")
        }),
        ("Status & Categoria", {
            "fields": ("categoria", "categoria_solicitada", "aprovado")
        }),
        ("Grupos e permissões", {
            "fields": ("groups", "user_permissions")
        }),
    )
