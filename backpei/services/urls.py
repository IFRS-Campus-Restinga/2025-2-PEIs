from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *



router = DefaultRouter()
router.register(r'dados', DadosViewSet, basename='dados')
router.register(r'cursos', CursoViewSet, basename='cursos')
router.register(r'disciplinas', DisciplinaViewSet, basename='disciplinas')
app_name = 'api'
urlpatterns = [
    path('', include(router.urls)),
]