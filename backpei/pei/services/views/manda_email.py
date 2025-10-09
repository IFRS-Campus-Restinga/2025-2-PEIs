from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import status
from ..permissions import BackendTokenPermission

@api_view(['POST'])
# utiliza o nosso permission do token
@permission_classes([BackendTokenPermission])
def manda_email(request):
    data = request.data
    destino = data.get("destino")
    assunto = data.get("assunto")
    texto = data.get("texto")

    if not destino or not assunto or not texto:
        return Response({"erro": "campos destino, assunto e texto precisam existir"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        send_mail(
            subject=assunto,
            message=texto,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[destino],
            fail_silently=False,
        )
        return Response({"status": "ok", "message": "Email enviado"}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"erro": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
