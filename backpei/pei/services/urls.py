from django.urls import path, include
from rest_framework.routers import DefaultRouter

# === VIEWSETS ===
from .views.PEIPeriodoLetivo_view_set import PEIPeriodoLetivoViewSet
from .views.parecer_view_set import ParecerViewSet
from .views.pei_central_view_set import PeiCentralViewSet
from .views.aluno_view_set import AlunoViewSet
from .views.componenteCurricular_view_set import ComponenteCurricularViewSet
from .views.ataDeAcompanhamento_view_set import AtaDeAcompanhamentoViewSet
from .views.documentacaoComplementar_view_set import DocumentacaoComplementarViewSet
from .views.disciplina_view_set import DisciplinaViewSet
from .views.curso_view_set import CursoViewSet
from .views.manda_email import manda_email, enviar_convite_reuniao
from .views.notificacao_view import NotificacaoViewSet
from .views.usuario_view_set import UsuarioViewSet
from .views.permissoes_view_set import UsuarioPermissoesView
from .views.conteudo_view_set import ConteudoViewSet
from .views.consulta_grupos import ConsultaGrupos
from .views.model_schema_view import ModelSchemaView
from .views.dashboard_view import DashboardView
from .views.acompanhamento_view import (acompanhar_recusar, acompanhar_aceitar)
from .views.mensagem_view_set import MensagemViewSet

from .views.report_view import ReportarProblemaView

# === OUTRAS VIEWS ===
from .views.manda_email import manda_email
from .views.notificacao_lista import listar_notificacoes
from .views.permissoes_view_set import UsuarioPermissoesView
from .views.aprovar_solicitacao_view import AprovarSolicitacaoRegistroView
from .views.registro_view import RegistrarUsuarioView
from .views.login_view import LoginView
from .views.auth_login import login_usuario   # ← ESSA É A VIEW QUE FUNCIONA 100%

# Router do DRF
router = DefaultRouter()
router.register(r'PEIPeriodoLetivo', PEIPeriodoLetivoViewSet, basename='PEIPeriodoLetivo')
router.register(r'parecer', ParecerViewSet, basename='parecer')
router.register(r'aluno', AlunoViewSet, basename='aluno')
router.register(r'componenteCurricular', ComponenteCurricularViewSet, basename='componenteCurricular')
router.register(r'cursos', CursoViewSet, basename='cursos')
router.register(r'disciplinas', DisciplinaViewSet, basename='disciplinas')
router.register(r'pei_central', PeiCentralViewSet, basename='pei_central')
router.register(r'ataDeAcompanhamento', AtaDeAcompanhamentoViewSet, basename='ataDeAcompanhamento')
router.register(r'documentacaoComplementar', DocumentacaoComplementarViewSet, basename='documentacaoComplementar')
router.register(r'notificacoes', NotificacaoViewSet, basename='notificacao')
router.register(r'usuario', UsuarioViewSet, basename='usuarios')
router.register(r'conteudo', ConteudoViewSet, basename='conteudos')
router.register(r'schema', ModelSchemaView, basename="model-schema")
router.register(r'mensagens', MensagemViewSet, basename='mensagens')

app_name = 'api'

urlpatterns = [
    # DRF router (todas as suas APIs)
    path('', include(router.urls)),

    # Suas rotas específicas
    path('mandaEmail/', manda_email, name='mandaEmail'),
    path("enviarConviteReuniao/", enviar_convite_reuniao, name='enviarConviteReuniao'),
    path('notificacoes-lista/', listar_notificacoes, name='notificacoes-lista'),
    path("permissoes/", UsuarioPermissoesView.as_view(), name="usuario-permissoes"),
    path('consultaGrupos/', ConsultaGrupos.as_view(), name='consultaGrupos'),
    path('dashboard/', DashboardView.as_view(), name='dashboard-stats'),
    path("acompanhamentos/<id>/recusar/", acompanhar_recusar, name="recusar_acompanhamento"),
    path("acompanhamentos/<id>/aceitar/", acompanhar_aceitar, name="aceitar_acompanhamento"),
    path('reportar-problema/', ReportarProblemaView.as_view(), name='reportar-problema'),

]
