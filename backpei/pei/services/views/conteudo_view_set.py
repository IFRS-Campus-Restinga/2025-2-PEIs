from rest_framework.viewsets import ModelViewSet
from ..serializers import ConteudoSerializer
from pei.models.conteudo import Conteudo
from ..permissions import BackendTokenPermission

class ConteudoViewSet(ModelViewSet):
    queryset = Conteudo.objects.all()
    serializer_class = ConteudoSerializer
    permission_classes = [BackendTokenPermission]

    # filtrar e retornar apenas os dados permitidos
    def get_queryset(self):
        queryset = super().get_queryset()
        # recebe email e grupo
        email = self.request.headers.get("X-User-Email")
        grupo = self.request.headers.get("X-User-Group")
        # abre a lista
        permitidos = []
        for item in queryset:
            emails = item.emails_autorizados or []
            grupos = item.grupos_autorizados or []
            # postagem publica
            if len(emails) == 0 and len(grupos) == 0:
                permitidos.append(item.id)
                continue
            # se o email estiver liberado
            if email in emails:
                permitidos.append(item.id)
                continue
            # se o grupo estiver liberado
            if grupo in grupos:
                permitidos.append(item.id)
                continue
        # devolve a lista de permitidos
        return queryset.filter(id__in=permitidos)

    # utiliza o email recebido do front como autor pra salvar
    def perform_create(self, serializer):
        email = self.request.headers.get("X-User-Email")
        serializer.save(autor=email)
