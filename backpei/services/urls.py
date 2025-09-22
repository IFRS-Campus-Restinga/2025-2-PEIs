from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.dados_view_set import DadosViewSet
from .views.PEIPeriodoLetivo_view_set import PEIPeriodoLetivoViewSet
from .views.parecer_view_set import ParecerViewSet
from .views.professor_view_set import ProfessorViewSet
from .views.curso_view_set import CursoViewSet
from .views.disciplina_view_set import DisciplinaViewSet
from .views.pei_central_view_set import PeiCentralViewSet

router = DefaultRouter()
router.register(r'dados', DadosViewSet, basename='dados')
router.register(r'PEIPeriodoLetivo', PEIPeriodoLetivoViewSet, basename='PEIPeriodoLetivo')
router.register(r'parecer', ParecerViewSet, basename='parecer')
router.register(r'professor', ProfessorViewSet, basename='professor')
router.register(r'cursos', CursoViewSet, basename='cursos')
router.register(r'disciplinas', DisciplinaViewSet, basename='disciplinas')
router.register(r'pei_central', PeiCentralViewSet, basename='pei_central')
app_name = 'api'
urlpatterns = [
    path('', include(router.urls)),
]