from django.contrib import admin
from pei.models.usuario import Usuario
from django.contrib.auth.models import User, Group


@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):

    list_display = ["email", "nome", "categoria_solicitada", "aprovado"]
    list_filter = ["aprovado", "categoria_solicitada"]
    search_fields = ["email", "nome"]
    readonly_fields = ["email", "nome", "categoria_solicitada"]

    actions = ["aprovar_usuario"]

    def aprovar_usuario(self, request, queryset):
        total = 0
        
        for usuario in queryset:

            if usuario.aprovado:
                continue  # já aprovado anteriormente

            # 1. Criar Django User
            user = User.objects.create_user(
                username=usuario.email,
                email=usuario.email,
                password=None,     # sem senha (login Google)
            )

            # 2. Atribuir grupo
            grupo_nome = usuario.categoria_solicitada.upper()

            grupo, created = Group.objects.get_or_create(name=grupo_nome)
            user.groups.add(grupo)

            # 3. Vincular User ao Usuario
            usuario.user = user
            usuario.aprovado = True
            usuario.save()

            total += 1

        self.message_user(
            request,
            f"{total} usuário(s) aprovado(s) com sucesso!"
        )

    aprovar_usuario.short_description = "Aprovar usuários selecionados"
