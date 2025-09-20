from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.dados_view_set import DadosViewSet
from .views.PEIPeriodoLetivo_view_set import PEIPeriodoLetivoViewSet
from .views.parecer_view_set import ParecerViewSet
from .views.professor_view_set import ProfessorViewSet
from .views.componenteCurricular import ComponenteCurricularViewSet
from .views.pedagogo_view_set import PedagogoViewSet



router = DefaultRouter()
router.register(r'dados', DadosViewSet, basename='dados')
router.register(r'PEIPeriodoLetivo', PEIPeriodoLetivoViewSet, basename='PEIPeriodoLetivo')
router.register(r'parecer', ParecerViewSet, basename='parecer')
router.register(r'professor', ProfessorViewSet, basename='professor')
router.register(r'componenteCurricular', ComponenteCurricularViewSet, basename='componenteCurricular')
router.register(r'pedagogo', PedagogoViewSet, basename='pedagogo')
app_name = 'api'
urlpatterns = [
    path('', include(router.urls)),
]