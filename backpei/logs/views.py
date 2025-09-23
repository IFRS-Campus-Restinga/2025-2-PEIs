from django.shortcuts import render
from rest_framework import viewsets
from .models import Log
from .serializers import LogSerializer

# Create your views here.

class LogViewSet(viewsets.ModelViewSet):
    queryset = Log.objects.all().order_by('-timestamp')
    serializer_class = LogSerializer
