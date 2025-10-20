from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import LogViewSet, FeedAtualizacoesView

router = DefaultRouter()
router.register(r'logs', LogViewSet, basename='logs')
router.register(r'feed', FeedAtualizacoesView, basename='feed')  # Agora com token

urlpatterns = [
    path('', include(router.urls)),
]
