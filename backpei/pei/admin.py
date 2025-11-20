from django.contrib import admin, messages
from django.utils import timezone
from django.utils.crypto import get_random_string

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.mail import send_mail
from django.db import transaction

from .models.PEIPeriodoLetivo import PEIPeriodoLetivo
from .models.parecer import Parecer
from .models.pei_central import PeiCentral
from .models.curso import Curso
from .models.disciplina import Disciplina
from .models.aluno import Aluno
from .models.usuario import Usuario
from .models.componenteCurricular import ComponenteCurricular
from .models.registration_request import RegistrationRequest


UserModel = get_user_model()


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

    # Apenas ações em lote
    actions = ['aprovar_selecionados', 'rejeitar_selecionados']

    def aprovar_selecionados(self, request, queryset):
        aprovados = 0
        for req in queryset.filter(status="pending"):
            try:
                with transaction.atomic():
                    # Gera senha temporária com get_random_string (não depende de managers)
                    senha = get_random_string(length=12)

                    # Cria o usuário de autenticação usando get_user_model (compatível com AUTH_USER_MODEL)
                    user = UserModel.objects.create_user(
                        username=req.email,
                        email=req.email,
                        password=senha,
                        first_name=req.name.split()[0] if req.name else "",
                        last_name=" ".join(req.name.split()[1:]) if req.name and len(req.name.split()) > 1 else "",
                        is_active=True,
                    )

                    # Adiciona ao grupo correto (professor, coordenador, etc)
                    try:
                        grupo = Group.objects.get(name__iexact=req.profile)
                        user.groups.add(grupo)
                    except Group.DoesNotExist:
                        pass

                    # Cria o seu perfil personalizado (modelo Usuario do PEI)
                    # Se Usuario tiver relação OneToOne com UserModel, ajuste para associar o user aqui.
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
                    try:
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
                    except Exception as mail_err:
                        # não estoura a transação por conta de erro de e-mail; opcional: registrar/logar
                        self.message_user(request, f"Usuário criado, mas falha ao enviar e-mail para {req.email}: {mail_err}", level=messages.WARNING)

                    aprovados += 1

            except Exception as e:
                # Usar messages.ERROR (inteiro) em vez de string
                self.message_user(request, f"Erro ao aprovar {req.email}: {str(e)}", level=messages.ERROR)

        if aprovados > 0:
            self.message_user(request, f"{aprovados} usuário(s) criado(s) e e-mail(s) enviado(s) com sucesso!", level=messages.SUCCESS)

    aprovar_selecionados.short_description = "Aprovar selecionados → criar usuário + enviar senha"

    def rejeitar_selecionados(self, request, queryset):
        rejeitados = queryset.filter(status="pending").update(
            status="REJECTED",
            reviewed_at=timezone.now()
        )
        self.message_user(request, f"{rejeitados} solicitação(ões) rejeitada(s).", level=messages.SUCCESS)

    rejeitar_selecionados.short_description = "Rejeitar selecionados"
