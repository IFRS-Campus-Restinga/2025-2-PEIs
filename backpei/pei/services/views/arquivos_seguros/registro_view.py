# pei/views/registro_view.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError

from pei.services.registration_service import RegistrationService
from pei.services.serializers.usuario_serializer import UsuarioSerializer

class RegistrarUsuarioView(APIView):

    def post(self, request):
        data = request.data
        try:
            usuario = RegistrationService.registrar_usuario({
                "nome": data.get("nome"),
                "email": data.get("email"),
                "senha": data.get("senha"),
                "tipo_usuario": data.get("perfil"),
                "matricula": data.get("matricula")  # opcional, se for aluno
            })

            serializer = UsuarioSerializer(usuario)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": f"Erro ao registrar usuário: {str(e)}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
