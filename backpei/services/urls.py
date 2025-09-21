from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.dados_view_set import DadosViewSet
from .views.PEIPeriodoLetivo_view_set import PEIPeriodoLetivoViewSet
from .views.parecer_view_set import ParecerViewSet
from .views.professor_view_set import ProfessorViewSet
from .views.aluno_view_set import AlunoViewSet
from .views.coordenadorCurso_view_set import CoordenadorCursoViewSet
from .views.curso_view_set import CursoViewSet, niveis_curso
from .views.disciplina_view_set import DisciplinaViewSet


router = DefaultRouter()
router.register(r'dados', DadosViewSet, basename='dados')
router.register(r'PEIPeriodoLetivo', PEIPeriodoLetivoViewSet, basename='PEIPeriodoLetivo')
router.register(r'parecer', ParecerViewSet, basename='parecer')
router.register(r'professor', ProfessorViewSet, basename='professor')
router.register(r'aluno', AlunoViewSet, basename='aluno')
router.register(r'coordenadorCurso', CoordenadorCursoViewSet, basename='coordenadorCurso')
router.register(r'cursos', CursoViewSet, basename='cursos')
router.register(r'disciplinas', DisciplinaViewSet, basename='disciplinas')
app_name = 'api'
urlpatterns = [
    path('', include(router.urls)),
    path('cursos/niveis/', niveis_curso, name='niveis_curso')
]