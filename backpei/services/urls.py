from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.dados_view_set import *
from .views.disciplina_view import *


router = DefaultRouter()
router.register(r'dados', DadosViewSet, basename='dados')
router.register(r'cursos', CursoViewSet, basename='cursos')
router.register(r'disciplinas', DisciplinaViewSet, basename='disciplinas')
router.register(r'disciplinas/create/<int:pk>', DisciplinaRetrieveUpdateDestroyView, basename='disciplina_detail')
app_name = 'api'
urlpatterns = [
    path('', include(router.urls)),
]