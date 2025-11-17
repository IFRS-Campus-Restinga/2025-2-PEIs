# backpei/pei/services/registration_request.py

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import transaction

from pei.models.usuario import Usuario
from pei.models.aluno import Aluno
from pei.models.pei_central import PeiCentral

User = get_user_model()


class RegistrationService:
    """
    Serviço responsável pelo fluxo de criação de usuários, alunos
    e objetos relacionados ao cadastro de PEIs.
    """

    @staticmethod
    @transaction.atomic
    def registrar_usuario(data: dict):
        """
        Cria um usuário + perfil relacionado.
        Data esperada:
        {
            "nome": "Fulano",
            "email": "teste@email.com",
            "senha": "123456",
            "tipo_usuario": "ALUNO" ou "COORDENADOR" etc.
            "matricula": "2025xxxx" (se for aluno)
        }
        """

        # ======================
        # 1. Criar usuário base
        # ======================

        if User.objects.filter(email=data["email"]).exists():
            raise ValidationError("Este e-mail já está cadastrado.")

        user = User.objects.create_user(
            username=data["email"],
            email=data["email"],
            password=data["senha"]
        )

        # ==========================
        # 2. Criar perfil de usuário
        # ==========================

        usuario = Usuario.objects.create(
            user=user,
            nome=data["nome"],
            tipo_usuario=data["tipo_usuario"]
        )

        # ================================
        # 3. Criar objetos específicos
        # ================================
        if data["tipo_usuario"] == "ALUNO":
            aluno = Aluno.objects.create(
                usuario=usuario,
                matricula=data.get("matricula")
            )

            # Criação automática de um PEI (opcional)
            PeiCentral.objects.create(
                aluno=aluno,
                status="EM_ANDAMENTO"
            )

        # Outros perfis podem ser criados aqui:
        # if tipo_usuario == "COORDENADOR": ...
        # if tipo_usuario == "NAPNE": ...
        # ...

        return usuario

