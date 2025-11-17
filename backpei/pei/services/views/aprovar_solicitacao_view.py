from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db import transaction
from django.contrib.auth.models import Group
from django.shortcuts import get_object_or_404

from pei.models.registration_request import RegistrationRequest
from pei.models.usuario import Usuario
from pei.services.serializers.usuario_serializer import UsuarioSerializer


class AprovarSolicitacaoRegistroView(APIView):

    def post(self, request, request_id):
        # Buscar solicitação
        solicitacao = get_object_or_404(RegistrationRequest, id=request_id)

        # Impedir ações duplicadas
        if solicitacao.status in ["APPROVED", "REJECTED"]:
            return Response(
                {"error": f"Esta solicitação já foi {solicitacao.status}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        acao = request.data.get("acao")  # "APROVAR" ou "REJEITAR"

        if acao not in ["APROVAR", "REJEITAR"]:
            return Response(
                {"error": "Ação inválida. Use 'APROVAR' ou 'REJEITAR'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():

                # --- REJEITAR ---
                if acao == "REJEITAR":
                    solicitacao.status = "REJECTED"
                    solicitacao.reviewed_at = timezone.now()
                    solicitacao.created_user = None
                    solicitacao.save()

                    return Response(
                        {"message": "Solicitação rejeitada com sucesso."},
                        status=status.HTTP_200_OK
                    )

                # --- APROVAR ---
                if acao == "APROVAR":

                    # Gera uma senha automática
                    senha_gerada = Usuario.objects.make_random_password()

                    # Criar usuário com base nos dados da solicitação
                    usuario = Usuario.objects.create_user(
                        username=solicitacao.email,
                        email=solicitacao.email,
                        nome=solicitacao.name,
                        categoria=solicitacao.profile,
                        password=senha_gerada,
                        is_active=True
                    )

                    # Adicionar ao grupo correto
                    try:
                        grupo = Group.objects.get(name=usuario.categoria)
                        usuario.groups.add(grupo)
                    except Group.DoesNotExist:
                        pass

                    # Atualizar a solicitação
                    solicitacao.status = "APPROVED"
                    solicitacao.reviewed_at = timezone.now()
                    solicitacao.created_user = usuario
                    solicitacao.save()

                    return Response(
                        {
                            "message": "Solicitação aprovada e usuário criado com sucesso.",
                            "senha_gerada": senha_gerada,
                            "usuario": UsuarioSerializer(usuario).data
                        },
                        status=status.HTTP_200_OK
                    )

        except Exception as e:
            return Response(
                {"error": f"Erro ao processar solicitação: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
