from django.shortcuts import render
from rest_framework import viewsets
from .models import Log
from .serializers import LogSerializer
from pei.services.permissions import BackendTokenPermission
from rest_framework.pagination import PageNumberPagination

# Create your views here.

class logPagination(PageNumberPagination):
    page_size = 1000
    page_size_query_param = 'page_size'
    max_page_size = 100


class LogViewSet(viewsets.ModelViewSet):
    queryset = Log.objects.all().order_by('-timestamp')
    serializer_class = LogSerializer
    permission_classes = [BackendTokenPermission]
    pagination_class = logPagination