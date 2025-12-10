from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.core.mail import send_mail
from django.conf import settings

class ReportarProblemaView(APIView):
    # Usando allowany pra qualquer um poder reportar, se quiser que só logado, troca pra IsAuthenticated
    permission_classes = [AllowAny] 

    def post(self, request):
        data = request.data
        
        assunto = data.get('assunto', 'Sem assunto')
        descricao = data.get('descricao', '')
        url = data.get('url', '')
        navegador = data.get('navegador', '')
        
        # Quem enviou? (Se logado pega do request, senão diz Anônimo)
        usuario = "Anônimo"
        if request.user and request.user.is_authenticated:
            usuario = f"{request.user.first_name} ({request.user.email})"

        # Monta o corpo do e-mail
        corpo_email = f"""
        NOVO REPORTE DE PROBLEMA NO SISTEMA PEI
        ---------------------------------------
        
        Usuário: {usuario}
        Assunto: {assunto}
        URL do erro: {url}
        Navegador: {navegador}
        
        Descrição do Usuário:
        {descricao}
        """

        # Envia para o ADMIN do sistema (ou um email fixo de suporte)
        # Aqui vou colocar para enviar para o próprio email configurado no settings (EMAIL_HOST_USER) que é o do ifrspei@gmail.com
        # mas pode por um fixo tipo "suporte@restinga..." ou algo assim
        destinatario = settings.EMAIL_HOST_USER 

        try:
            send_mail(
                subject=f"[SUPORTE PEI] {assunto}",
                message=corpo_email,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[destinatario], # Manda para o "dono" do sistema
                fail_silently=False,
            )
            return Response({"status": "ok", "message": "E-mail enviado com sucesso"})
        except Exception as e:
            print(f"Erro ao enviar email de suporte: {e}")
            return Response({"error": str(e)}, status=500)