from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import Group, User
from rest_framework import status
from pei.models.usuario import Usuario


# ----------------------------------------------------
# MAPEAMENTO ENTRE nomes que chegam do front
# e nomes reais dos grupos no Django
# ----------------------------------------------------
GRUPO_MAP = {
    "PROFESSOR": "Professor",
    "PEDAGOGO": "Pedagogo",
    "COORDENADOR": "Coordenador",
    "NAPNE": "NAPNE",
    "ADMIN": "Admin"
}


# ----------------------------------------------------
# Função auxiliar — verifica se o usuário da sessão é Admin
# ----------------------------------------------------
def is_admin(user):
    return user.groups.filter(name="Admin").exists()


# ----------------------------------------------------
# Lista todas as solicitações pendentes
# ----------------------------------------------------
class SolicitacoesPendentesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin(request.user):
            return Response({"detail": "Acesso negado."}, status=403)

        pendentes = Usuario.objects.filter(aprovado=False)

        data = [
            {
                "id": u.id,
                "email": u.email,
                "nome": u.nome,
                "categoria_solicitada": u.categoria_solicitada
            }
            for u in pendentes
        ]

        return Response(data, status=200)


# ----------------------------------------------------
# Aprovar solicitação
# ----------------------------------------------------
class AprovarSolicitacaoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not is_admin(request.user):
            return Response({"detail": "Acesso negado."}, status=403)

        usuario_id = request.data.get("id")
        if not usuario_id:
            return Response({"detail": "ID obrigatório."}, status=400)

        try:
            usuario = Usuario.objects.get(id=usuario_id)
        except Usuario.DoesNotExist:
            return Response({"detail": "Solicitação não encontrada."}, status=404)

        # ----------------------------------------------------
        # 1) Criar Django User apenas se ainda não existir
        # ----------------------------------------------------
        user = usuario.user
        if not user:
            user, created = User.objects.get_or_create(
                username=usuario.email,
                defaults={"email": usuario.email}
            )
            user.set_unusable_password()
            user.save()
            usuario.user = user

        # ----------------------------------------------------
        # 2) Marcar como aprovado
        # ----------------------------------------------------
        usuario.aprovado = True
        usuario.save()

        # ----------------------------------------------------
        # 3) Descobrir nome correto do grupo
        # ----------------------------------------------------
        categoria = (usuario.categoria_solicitada or "").upper()
        nome_grupo_real = GRUPO_MAP.get(categoria)

        if not nome_grupo_real:
            return Response(
                {"detail": f"Categoria '{usuario.categoria_solicitada}' não corresponde a nenhum grupo válido."},
                status=400
            )

        # ----------------------------------------------------
        # 4) Atribuir ao grupo real do Django
        # ----------------------------------------------------
        try:
            grupo = Group.objects.get(name=nome_grupo_real)
            user.groups.add(grupo)
        except Group.DoesNotExist:
            return Response(
                {"detail": f"Grupo '{nome_grupo_real}' não encontrado no sistema."},
                status=400
            )

        return Response({"status": "aprovado"}, status=200)


# ----------------------------------------------------
# Rejeitar solicitação
# ----------------------------------------------------
class RejeitarSolicitacaoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not is_admin(request.user):
            return Response({"detail": "Acesso negado."}, status=403)

        usuario_id = request.data.get("id")
        if not usuario_id:
            return Response({"detail": "ID obrigatório."}, status=400)

        try:
            usuario = Usuario.objects.get(id=usuario_id)
        except Usuario.DoesNotExist:
            return Response({"detail": "Solicitação não encontrada."}, status=404)

        usuario.delete()

        return Response({"status": "rejeitado"}, status=200)
