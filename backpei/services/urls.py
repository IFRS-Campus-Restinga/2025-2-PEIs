from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.dados_view_set import DadosViewSet
from .views.PEIPeriodoLetivo_view_set import PEIPeriodoLetivoViewSet
from .views.parecer_view_set import ParecerViewSet
from .views.professor_view_set import ProfessorViewSet
from .views.pei_central_view_set import PeiCentralViewSet
from .views.aluno_view_set import AlunoViewSet
from .views.coordenadorCurso_view_set import CoordenadorCursoViewSet
from .views.componenteCurricular_view_set import ComponenteCurricularViewSet
from .views.ataDeAcompanhamento_view_set import AtaDeAcompanhamentoViewSet
from .views.documentacaoComplementar_view_set import DocumentacaoComplementarViewSet
from .views.pedagogo_view_set import PedagogoViewSet
from .views.disciplina_view_set import DisciplinaViewSet
from .views.curso_view_set import CursoViewSet

router = DefaultRouter()
router.register(r'dados', DadosViewSet, basename='dados')
router.register(r'PEIPeriodoLetivo', PEIPeriodoLetivoViewSet, basename='PEIPeriodoLetivo')
router.register(r'parecer', ParecerViewSet, basename='parecer')
router.register(r'professor', ProfessorViewSet, basename='professor')
router.register(r'aluno', AlunoViewSet, basename='aluno')
router.register(r'coordenadorCurso', CoordenadorCursoViewSet, basename='coordenadorCurso')
router.register(r'componenteCurricular', ComponenteCurricularViewSet, basename='componenteCurricular')
router.register(r'pedagogo', PedagogoViewSet, basename='pedagogo')
router.register(r'cursos', CursoViewSet, basename='cursos')
router.register(r'disciplinas', DisciplinaViewSet, basename='disciplinas')
router.register(r'pei_central', PeiCentralViewSet, basename='pei_central')
router.register(r'ataDeAcompanhamento', AtaDeAcompanhamentoViewSet, basename='ataDeAcompanhamento')
router.register(r'documentacaoComplementar', DocumentacaoComplementarViewSet, basename='documentacaoComplementar')

app_name = 'api'
urlpatterns = [
    path('', include(router.urls)),
]