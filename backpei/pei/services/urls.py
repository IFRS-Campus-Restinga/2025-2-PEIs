from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views.PEIPeriodoLetivo_view_set import PEIPeriodoLetivoViewSet
from .views.parecer_view_set import ParecerViewSet
from .views.pei_central_view_set import PeiCentralViewSet
from .views.aluno_view_set import AlunoViewSet
from .views.componenteCurricular_view_set import ComponenteCurricularViewSet
from .views.ataDeAcompanhamento_view_set import AtaDeAcompanhamentoViewSet
from .views.documentacaoComplementar_view_set import DocumentacaoComplementarViewSet
from .views.disciplina_view_set import DisciplinaViewSet
from .views.curso_view_set import CursoViewSet
from .views.manda_email import manda_email
from .views.notificacao_view import NotificacaoViewSet
from .views.notificacao_lista import listar_notificacoes
from .views.usuario_view_set import UsuarioViewSet
from .views.permissoes_view_set import UsuarioPermissoesView
from .views.aprovar_solicitacao_view import AprovarSolicitacaoRegistroView
from .views.registro_view import RegistrarUsuarioView
from .views.login_view import LoginView

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

app_name = 'api'

urlpatterns = [
    path('', include(router.urls)),
    path('mandaEmail/', manda_email, name='mandaEmail'),
    path('notificacoes-lista/', listar_notificacoes, name='notificacoes-lista'),
    path("permissoes/", UsuarioPermissoesView.as_view(), name="usuario-permissoes"),
    path(
        "registration-request/<int:request_id>/review/",
        AprovarSolicitacaoRegistroView.as_view(),
        name="aprovar-solicitacao-registro"
    ),
    path('usuarios/registrar/', RegistrarUsuarioView.as_view(), name='registrar-usuario'),
    path("api/login/", LoginView.as_view(), name="api-login"),
]
