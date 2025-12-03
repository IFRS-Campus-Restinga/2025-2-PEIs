from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from pei.models.acompanhamento import Acompanhamento
from pei.services.serializers.acompanhamento_serializer import AcompanhamentoSerializer


# LISTAR acompanhamentos do estudante logado
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def listar_meus_acompanhamentos(request):
    acompanhamentos = Acompanhamento.objects.filter(aluno=request.user).order_by("-criado_em")
    serializer = AcompanhamentoSerializer(acompanhamentos, many=True)
    return Response(serializer.data)


# DETALHE de um acompanhamento
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def detalhe_acompanhamento(request, id):
    acompanhamento = get_object_or_404(Acompanhamento, id=id, aluno=request.user)
    serializer = AcompanhamentoSerializer(acompanhamento)
    return Response(serializer.data)


# RECUSAR um acompanhamento
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def recusar_acompanhamento(request, id):
    acompanhamento = get_object_or_404(Acompanhamento, id=id, aluno=request.user)

    motivo = request.data.get("motivo")
    if not motivo:
        return Response(
            {"erro": "O motivo da recusa é obrigatório."},
            status=status.HTTP_400_BAD_REQUEST
        )

    acompanhamento.recusar(motivo)
    serializer = AcompanhamentoSerializer(acompanhamento)
    return Response(serializer.data)


# ACEITAR acompanhamento
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def aceitar_acompanhamento(request, id):
    acompanhamento = get_object_or_404(Acompanhamento, id=id, aluno=request.user)

    acompanhamento.aceitar()
    serializer = AcompanhamentoSerializer(acompanhamento)
    return Response(serializer.data)
