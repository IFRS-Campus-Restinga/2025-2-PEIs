from django.http import HttpResponse
from pei.models import Acompanhamento

def acompanhar_aceitar(request, id):
    try:
        acompanhamento = Acompanhamento.objects.get(id=id)
        acompanhamento.status = "aceito"
        acompanhamento.save()
        return HttpResponse("Acompanhamento ACEITO com sucesso.")
    except Acompanhamento.DoesNotExist:
        return HttpResponse("Acompanhamento não encontrado.", status=404)


def acompanhar_recusar(request, id):
    try:
        acompanhamento = Acompanhamento.objects.get(id=id)
        acompanhamento.status = "recusado"
        acompanhamento.save()
        return HttpResponse("Acompanhamento RECUSADO com sucesso.")
    except Acompanhamento.DoesNotExist:
        return HttpResponse("Acompanhamento não encontrado.", status=404)
