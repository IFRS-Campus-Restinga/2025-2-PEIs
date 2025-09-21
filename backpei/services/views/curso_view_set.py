from rest_framework.viewsets import ModelViewSet
from ..serializers.curso_serializer import *
from pei.models import *
from ..permissions import BackendTokenPermission
from rest_framework.decorators import api_view
from rest_framework.response import Response
from pei.enums.nivel import Nivel

class CursoViewSet(ModelViewSet):
    queryset = Curso.objects.all()
    serializer_class = CursoSerializer
    permission_classes = [BackendTokenPermission]

@api_view(['GET'])
def niveis_curso(request):
    data = [{"value": v[0], "label": v[1]} for v in Nivel.choices]
    return Response(data)