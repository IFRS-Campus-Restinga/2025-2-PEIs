from rest_framework import generics
from rest_framework.permissions import AllowAny
from ...services.serializers.disciplina_serializer import DisciplinaSerializer
from ..models import Disciplina


class DisciplinaListCreateView(generics.ListCreateAPIView):
    queryset = Disciplina.objects.all()
    serializer_class = DisciplinaSerializer
    permission_classes = [AllowAny]