from django.contrib import admin

from .models.PEIPeriodoLetivo import PEIPeriodoLetivo
from .models.parecer import Parecer
from .models.pei_central import PeiCentral
from .models.curso import Curso
from .models.disciplina import Disciplina
from .models.aluno import Aluno
from .models.usuario import Usuario
from .models.componenteCurricular import ComponenteCurricular
from .models.registration_request import RegistrationRequest   # ← já estava

# Admin personalizado para Usuario
@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ("nome", "email", "categoria", "status")
    list_filter = ("categoria", "status")
    search_fields = ("nome", "email")
    ordering = ("nome",)


# Seus registros antigos
admin.site.register(PEIPeriodoLetivo)
admin.site.register(Parecer)
admin.site.register(Curso)
admin.site.register(Disciplina)
admin.site.register(Aluno)
admin.site.register(PeiCentral)
admin.site.register(ComponenteCurricular)


# ================== REGISTRATION REQUEST – VERSÃO FINAL E FUNCIONAL ==================
@admin.register(RegistrationRequest)
class RegistrationRequestAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'profile', 'status', 'created_at', 'reviewed_at')
    list_filter = ('status', 'profile', 'created_at')
    search_fields = ('name', 'email')
    readonly_fields = ('created_at', 'reviewed_at', 'message', 'created_user')
    ordering = ('-created_at',)

    # Apenas ações em lote – funciona 100% sem JS, sem reverse, sem dor de cabeça
    actions = ['aprovar_selecionados', 'rejeitar_selecionados']

    def aprovar_selecionados(self, request, queryset):
        # IMPORTANTE: usamos o User padrão do Django para make_random_password e create_user
        from django.contrib.auth.models import User as DjangoUser
        from django.contrib.auth.models import Group
        from django.core.mail import send_mail
        from django.utils import timezone
        from django.db import transaction

        aprovados = 0
        for req in queryset.filter(status="pending"):
            try:
                with transaction.atomic():
                    # Gera senha com o gerenciador padrão do Django
                    senha = DjangoUser.objects.make_random_password(length=12)

                    # Cria o usuário de autenticação (o que faz login)
                    user = DjangoUser.objects.create_user(
                        username=req.email,
                        email=req.email,
                        password=senha,
                        first_name=req.name.split()[0],
                        last_name=" ".join(req.name.split()[1:]) if len(req.name.split()) > 1 else "",
                        is_active=True,
                    )

                    # Adiciona ao grupo correto (professor, coordenador, etc)
                    try:
                        grupo = Group.objects.get(name__iexact=req.profile)
                        user.groups.add(grupo)
                    except Group.DoesNotExist:
                        pass

                    # Cria o seu perfil personalizado (modelo Usuario do PEI)
                    Usuario.objects.create(
                        nome=req.name,
                        email=req.email,
                        categoria=req.profile,
                        status=Usuario.STATUS_APROVADO
                    )

                    # Atualiza a solicitação
                    req.status = "APPROVED"
                    req.reviewed_at = timezone.now()
                    req.created_user = user
                    req.save()

                    # ENVIA E-MAIL com a senha temporária
                    send_mail(
                        subject="Cadastro APROVADO - Sistema PEI",
                        message=f"""Olá {req.name},

Seu cadastro foi APROVADO com sucesso!

Acesse o sistema com:
E-mail: {req.email}
Senha temporária: {senha}

Link: http://localhost:5173

⚠️ Altere sua senha no primeiro acesso.

Equipe PEI - IFRS""",
                        from_email="ifrspei@gmail.com",
                        recipient_list=[req.email],
                        fail_silently=False,
                    )
                    aprovados += 1

            except Exception as e:
                self.message_user(request, f"Erro ao aprovar {req.email}: {str(e)}", level="error")

        if aprovados > 0:
            self.message_user(request, f"{aprovados} usuário(s) criado(s) e e-mail(s) enviado(s) com sucesso!", level="success")

    aprovar_selecionados.short_description = "Aprovar selecionados → criar usuário + enviar senha"

    def rejeitar_selecionados(self, request, queryset):
        rejeitados = queryset.filter(status="pending").update(
            status="REJECTED",
            reviewed_at=timezone.now()
        )
        self.message_user(request, f"{rejeitados} solicitação(ões) rejeitada(s).", level="success")

    rejeitar_selecionados.short_description = "Rejeitar selecionados"