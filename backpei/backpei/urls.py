from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from django.shortcuts import redirect

urlpatterns = [
    path('', lambda request: redirect('/services/')),
    path('api/auth/', include('auth_app.urls')),
    path('admin/', admin.site.urls),
    path('services/', include('pei.services.urls')),
    path('logs/', include('logs.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)