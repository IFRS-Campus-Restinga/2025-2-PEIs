from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.dados_view_set import DadosViewSet
from .views.pei_central_view_set import PeiCentralViewSet

router = DefaultRouter()
router.register(r'dados', DadosViewSet, basename='dados')
router.register(r'list', PeiCentralViewSet, basename='list')


app_name = 'api'
urlpatterns = [
    path('', include(router.urls)),
]