from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group

User = get_user_model()

GRUPO_MAP = {
    "PROFESSOR": "Professor",
    "PEDAGOGO": "Pedagogo",
    "COORDENADOR": "Coordenador",
    "NAPNE": "NAPNE",
    "ADMIN": "Admin",
}


def is_admin(user):
    return user.groups.filter(name="Admin").exists()


# ----------------------------------------------------
# LISTAR SOLICITAÇÕES
# ----------------------------------------------------
class SolicitacoesPendentesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin(request.user):
            return Response({"detail": "Acesso negado."}, status=403)

        pendentes = User.objects.filter(aprovado=False)

        data = [{
            "id": u.id,
            "email": u.email,
            "nome": u.first_name or u.username,
            "categoria_solicitada": u.categoria_solicitada
        } for u in pendentes]

        return Response(data, status=200)


# ----------------------------------------------------
# APROVAR SOLICITAÇÃO
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
            user = User.objects.get(id=usuario_id)
        except User.DoesNotExist:
            return Response({"detail": "Solicitação não encontrada."}, status=404)

        categoria = (user.categoria_solicitada or "").upper()
        nome_grupo_real = GRUPO_MAP.get(categoria)

        if not nome_grupo_real:
            return Response(
                {"detail": f"Categoria '{user.categoria_solicitada}' inválida."},
                status=400
            )

        grupo = Group.objects.get(name=nome_grupo_real)
        user.groups.add(grupo)

        user.categoria = categoria
        user.aprovado = True
        user.save()

        return Response({"status": "aprovado"}, status=200)


# ----------------------------------------------------
# REJEITAR SOLICITAÇÃO
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
            user = User.objects.get(id=usuario_id)
        except User.DoesNotExist:
            return Response({"detail": "Solicitação não encontrada."}, status=404)

        user.delete()

        return Response({"status": "rejeitado"}, status=200)
