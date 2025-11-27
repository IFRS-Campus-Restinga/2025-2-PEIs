from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from pei.models.notificacao import Notificacao
from pei.services.serializers import NotificacaoSerializer
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
@permission_classes([IsAuthenticated]) 
def listar_notificacoes(request):
    # Filtra apenas as notificações do usuário logado
    user = request.user
    notificacoes = Notificacao.objects.filter(usuario=user).order_by('-data_criacao')
    
    serializer = NotificacaoSerializer(notificacoes, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)