# pei/views/notificacao_view.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from pei.models.notificacao import Notificacao
from pei.services.serializers import NotificacaoSerializer
from ..permissions import BackendTokenPermission

@api_view(['GET'])
@permission_classes([BackendTokenPermission])
def listar_notificacoes(request):
    notificacoes = Notificacao.objects.all().order_by('-data_criacao')
    serializer = NotificacaoSerializer(notificacoes, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
