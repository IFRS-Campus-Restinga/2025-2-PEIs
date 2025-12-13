from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import HttpResponse
from django.utils import timezone
from pei.models.aceite_eletronico import AceiteEletronico
from pei.utils.aceite_utils import make_signature, build_token, fetch_objeto_summary, send_aceite_email, split_token
from ..permissions import BackendTokenPermission
from django.conf import settings
import uuid

@api_view(['GET'])
@permission_classes([BackendTokenPermission])
def list_aceites(request):
    objeto_url = request.query_params.get("objeto_url")
    if not objeto_url:
        return Response([], status=status.HTTP_200_OK)

    registros = AceiteEletronico.objects.filter(objeto_url=objeto_url).order_by("enviado_em")
    data = []
    for r in registros:
        data.append({
            "id": r.id,
            "email_destinatario": r.email_destinatario,
            "enviado_em": r.enviado_em,
            "aceito_em": r.aceito_em,
            "ativo": r.ativo,
            "extra": r.extra,
        })
    return Response(data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([BackendTokenPermission])
def create_aceite(request):
    data = request.data
    destino = data.get("destino")
    objeto_url = data.get("objeto_url")
    assunto = data.get("assunto", None)
    extra = data.get("extra", {})

    if not destino or not objeto_url:
        return Response({"erro": "Campos 'destino' e 'objeto_url' são obrigatórios."}, status=status.HTTP_400_BAD_REQUEST)

    token_base = uuid.uuid4()
    signature = make_signature(destino, token_base)

    registro = AceiteEletronico.objects.create(
        email_destinatario=destino,
        objeto_url=objeto_url,
        token_base=token_base,
        token_hash=signature,
        extra=extra,
        enviado_em=timezone.now(),
        ativo=True
    )

    resumo = fetch_objeto_summary(objeto_url)

    token = build_token(str(token_base), signature)
    try:
        send_aceite_email(destino, token, objeto_url, resumo, assunto_custom=assunto)
    except Exception as e:
        registro.delete()
        return Response({"erro": f"Falha ao enviar email: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({"status": "ok", "id": registro.id, "mensagem": "Email enviado"}, status=status.HTTP_201_CREATED)


def accept_page(request, token: str):
    base, sig = split_token(token)
    if not base or not sig:
        return HttpResponse("<h1>Link inválido</h1><p>Formato do token inválido.</p>", status=400)

    try:
        registro = AceiteEletronico.objects.get(token_base=base)
    except AceiteEletronico.DoesNotExist:
        return HttpResponse("<h1>Link inválido</h1><p>Registro não encontrado.</p>", status=404)

    expected = make_signature(registro.email_destinatario, registro.token_base)
    if expected != sig or expected != registro.token_hash:
        return HttpResponse("<h1>Link inválido</h1><p>Assinatura inválida.</p>", status=400)

    if not registro.ativo:
        return HttpResponse("<h1>Link inválido</h1><p>Este pedido foi invalidado.</p>", status=400)

    if registro.aceito_em:
        return HttpResponse(f"<h1>Este pedido já foi aceite</h1><p>Aceite registrado em: {registro.aceito_em}</p>", status=200)

    registro.aceito_em = timezone.now()
    registro.ativo = False
    registro.save(update_fields=["aceito_em", "ativo"])

    return HttpResponse("<h1>Aceite registrado com sucesso!</h1><p>Obrigado. O seu aceite foi registrado.</p>", status=200)