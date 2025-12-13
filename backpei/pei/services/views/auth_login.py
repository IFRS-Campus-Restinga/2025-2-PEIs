# -*- coding: utf-8 -*-
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login
from django.contrib.auth import get_user_model
import json

from pei.models.usuario import Usuario

User = get_user_model()


@csrf_exempt
def login_usuario(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "error": "Método não permitido"}, status=405)

    try:
        payload = json.loads(request.body.decode('utf-8'))
    except:
        return JsonResponse({"success": False, "error": "JSON inválido"}, status=400)

    email = payload.get("email", "").strip().lower()
    senha = payload.get("senha", "")

    if not email or not senha:
        return JsonResponse({"success": False, "error": "E-mail e senha obrigatórios"}, status=400)

    # ======================================================
    # 1 — GARANTE QUE O USUÁRIO EXISTE PELO EMAIL
    # ======================================================
    try:
        user_obj = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        return JsonResponse({"success": False, "error": "Credenciais inválidas"}, status=200)

    # ======================================================
    # 2 — AUTENTICA USANDO username REAL DO DJANGO
    # ======================================================
    user = authenticate(request, username=user_obj.username, password=senha)

    if not user:
        return JsonResponse({"success": False, "error": "Credenciais inválidas"}, status=200)

    if not user.is_active:
        return JsonResponse({"success": False, "error": "Usuário inativo"}, status=200)

    # ======================================================
    # 3 — VERIFICA PERFIL DO PEI
    # ======================================================
    try:
        perfil = Usuario.objects.get(email__iexact=email)
    except Usuario.DoesNotExist:
        perfil = None

    if perfil and perfil.status != "APPROVED":
        return JsonResponse({
            "success": False,
            "error": "Cadastro pendente de aprovação",
            "status": perfil.status
        }, status=200)

    # ======================================================
    # 4 — LOGIN EFETUADO
    # ======================================================
    login(request, user)

    return JsonResponse({
        "success": True,
        "usuario": {
            "id": perfil.id if perfil else None,
            "email": user.email,
            "nome": perfil.nome if perfil else user.get_full_name() or user.username,
            "categoria": getattr(perfil, "categoria", "PROFESSOR"),
            "status": "APPROVED"
        }
    }, status=200)
