from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from pei.models.aluno import Aluno
from pei.models.pei_central import PeiCentral
from pei.models.notificacao import Notificacao

User = get_user_model()

class DashboardView(APIView):
    # Garante que sabemos quem é o usuário para filtrar notificações dele
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Verifica se é admin para contar solicitações
        is_admin = user.groups.filter(name="Admin").exists()

        # Contagens Gerais
        # (Dependendo da regra de negócio, poderíamos filtrar alunos por curso do coordenador,
        # mas para um dashboard geral, counts totais funcionam bem para impressionar)
        total_alunos = Aluno.objects.count()
        total_peis = PeiCentral.objects.count()
        
        # Notificações pessoais não lidas
        notificacoes_nao_lidas = Notificacao.objects.filter(usuario=user, lida=False).count()

        # Dados base
        data = {
            "total_alunos": total_alunos,
            "total_peis": total_peis,
            "notificacoes_pendentes": notificacoes_nao_lidas,
            "solicitacoes_pendentes": 0, # Padrão zero
            "is_admin": is_admin
        }

        # Se for Admin, conta usuários pendentes
        if is_admin:
            data["solicitacoes_pendentes"] = User.objects.filter(aprovado=False).count()

        return Response(data)