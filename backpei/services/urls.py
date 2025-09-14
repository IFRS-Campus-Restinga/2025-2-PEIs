from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.dados_view_set import DadosViewSet

router = DefaultRouter()
router.register(r'dados', DadosViewSet, basename='dados')
app_name = 'api'
urlpatterns = [
    path('', include(router.urls)),
]