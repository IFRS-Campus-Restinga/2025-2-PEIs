# backpei/pei/services/views/auth_login.py

from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

# modelo Perfil
from pei.models.usuario import Usuario


@csrf_exempt
def login_usuario(request):
    if request.method != "POST":
        return JsonResponse({"error": "Método não permitido"}, status=405)

    try:
        data = json.loads(request.body)
    except Exception:
        return JsonResponse({"error": "Requisição inválida"}, status=400)

    email = data.get("email")
    senha = data.get("senha")

    if not email or not senha:
        return JsonResponse(
            {"success": False, "error": "Email e senha são obrigatórios."},
            status=400
        )

    # autentica usando username=email
    user = authenticate(request, username=email, password=senha)

    if user is None:
        return JsonResponse(
            {"success": False, "error": "Credenciais inválidas."},
            status=401
        )

    if not user.is_active:
        return JsonResponse(
            {"success": False, "error": "Usuário inativo."},
            status=403
        )

    # cria sessão Django
    login(request, user)

    # dados base
    usuario_data = {
        "id_user": user.id,
        "email": user.email,
        "nome": user.first_name or "",
        "status": "APPROVED" if user.is_active else "PENDING",
        "categoria": None
    }

    # Tenta localizar o perfil (tabela Usuario)
    perfil = Usuario.objects.filter(email=user.email).first()

    if perfil:
        usuario_data.update({
            "id": perfil.id,
            "nome": perfil.nome or usuario_data["nome"],
            "categoria": perfil.categoria,
            "status": perfil.status,
        })
    else:
        # importante: não bloquear login
        usuario_data.update({
            "id": None,
            "categoria": "SEM_PERFIL",
            "status": "APPROVED",  # user.is_active manda!
        })

    return JsonResponse({"success": True, "usuario": usuario_data}, status=200)
