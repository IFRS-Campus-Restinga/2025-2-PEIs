from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.pessoa import PessoaViewSet
from .views.ataDeAcompanhamento import AtaDeAcompanhamentoViewSet
from .views.componenteCurricular import ComponenteCurricularViewSet
from .views.curso import CursoViewSet
from .views.disciplina import DisciplinaViewSet
from .views.documentacaoComplementar import DocumentacaoComplementarViewSet

router = DefaultRouter()
router.register(r'pessoa', PessoaViewSet, basename='pessoa')
router.register(r'ataDeAcompanhamento', AtaDeAcompanhamentoViewSet, basename='ataDeAcompanhamento')
router.register(r'componenteCurricular', ComponenteCurricularViewSet, basename='componenteCurricular')
router.register(r'curso', CursoViewSet, basename='curso')
router.register(r'disciplina', DisciplinaViewSet, basename='disciplina')
router.register(r'documentacaoComplementar', DocumentacaoComplementarViewSet, basename='documentacaoComplementar')




app_name = 'api'
urlpatterns = [
    path('', include(router.urls)),
]