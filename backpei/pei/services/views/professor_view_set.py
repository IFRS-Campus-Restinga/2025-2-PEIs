from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework import status
from ..serializers.professor_seralizer import ProfessorSerializer
from pei.models.professor import Professor
from ..permissions import BackendTokenPermission
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.db.models import ProtectedError  # IMPORTANTE

class ProfessorViewSet(ModelViewSet):
    queryset = Professor.objects.all()
    serializer_class = ProfessorSerializer
    permission_classes = [BackendTokenPermission]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        try:
            instance.safe_delete()  # Seu método customizado
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except ValidationError as e:
            # Erro de validação customizada (seu safe_delete)
            return Response(
                {"erro": str(e.message) if hasattr(e, 'message') else str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        except ProtectedError as e:
            # FK com on_delete=PROTECT (mais comum!)
            return Response(
                {"erro": "Não é possível deletar: professor vinculado a PEIs ou outros registros."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        except IntegrityError as e:
            # Qualquer violação de integridade
            return Response(
                {"erro": f"Erro de integridade no banco: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        except Exception as e:
            # Qualquer outro erro inesperado
            return Response(
                {"erro": f"Erro interno do servidor: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )