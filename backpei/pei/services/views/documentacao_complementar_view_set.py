from rest_framework.viewsets import ModelViewSet
from ..serializers import DocumentacaoComplementarSerializer
from pei.models import DocumentacaoComplementar
from ..permissions import BackendTokenPermission

class DocumentacaoComplementarViewSet(ModelViewSet):
    queryset = DocumentacaoComplementar.objects.all()
    serializer_class = DocumentacaoComplementarSerializer
    permission_classes = [BackendTokenPermission]