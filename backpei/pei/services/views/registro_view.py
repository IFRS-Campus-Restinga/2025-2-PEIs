# pei/services/views/registro_view.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from django.core.exceptions import ValidationError

from pei.models.registration_request import RegistrationRequest
from pei.services.serializers.registration_request_serializer import RegistrationRequestSerializer


class RegistrarUsuarioView(APIView):
    """
    Recebe dados de cadastro e cria um RegistrationRequest.
    Campos aceitos:
    - nome
    - email
    - senha (guardado apenas como message)
    - tipo_usuario (coordenador/pedagogo/napne/professor)
    - matricula (opcional, salvo também em message)
    """

    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data

        try:
            nome = data.get("nome")
            email = data.get("email")
            senha = data.get("senha")
            tipo_usuario = data.get("tipo_usuario")
            matricula = data.get("matricula")

            if not nome or not email or not senha or not tipo_usuario:
                raise ValidationError("Campos obrigatórios: nome, email, senha e tipo_usuario.")

            # Model só aceita perfis minúsculos
            tipo_usuario = tipo_usuario.lower()

            PROFILE_VALIDOS = ["coordenador", "pedagogo", "napne", "professor"]

            if tipo_usuario not in PROFILE_VALIDOS:
                raise ValidationError(
                    f"tipo_usuario inválido. Opções: {PROFILE_VALIDOS}"
                )

            # Criamos a mensagem com dados adicionais
            extra_message = f"Senha: {senha}"
            if matricula:
                extra_message += f" | Matrícula: {matricula}"

            solicitacao = RegistrationRequest.objects.create(
                name=nome,
                email=email,
                profile=tipo_usuario,
                message=extra_message,
                status="pending"
            )

            serializer = RegistrationRequestSerializer(solicitacao)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response(
                {"error": f"Erro ao criar solicitação: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
