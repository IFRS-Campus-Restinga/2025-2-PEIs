import os
import shutil
import subprocess
import sys
import django
import rest_framework


# ------------------------------------------
# pegando nosso diretorio atual, vai valer onde esta o script
# portanto deixe ele na pasta raiz de tudo, onde esta python, node e os projetos
baseDir = os.path.abspath(os.getcwd())
rodapy = os.path.join(baseDir, "python", "python.exe")


# ------------------------------------------
# agora queremos interagir com o projeto do django, entao precisamos apontar
sys.path.append(os.path.join(baseDir, "backpei"))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backpei.settings")
django.setup()

# imports do django
from django.contrib.auth.models import User, Group, Permission
from rest_framework.authtoken.models import Token
from django.contrib.contenttypes.models import ContentType

# imports dos modelos
from pei.models.pei_central import PeiCentral
from pei.models.PEIPeriodoLetivo import PEIPeriodoLetivo
from pei.models.componenteCurricular import ComponenteCurricular
from pei.models.aluno import Aluno
from pei.models.disciplina import Disciplina
from pei.models.curso import Curso
from pei.models.ataDeAcompanhamento import AtaDeAcompanhamento
from pei.models.usuario import Usuario
from pei.models.parecer import Parecer
from pei.models.documentacaoComplementar import DocumentacaoComplementar


# ------------------------------------------
# funcao pra rodar comandos nativos através do python
def roda(cmd, cwd=None, show=True, ambiente=None):
    if show:
        print(f"> {' '.join(cmd)}")
    env = os.environ.copy()
    if ambiente:
        env.update(ambiente)
    subprocess.run(cmd, cwd=cwd, check=False, env=env, stdout=sys.stdout, stderr=sys.stderr)


# ------------------------------------------
# apenas pergunta sim ou nao
def pergunta(msg):
    while True:
        resp = input(f"{msg} (s/n): ").strip().lower()
        if resp in ["s", "n"]:
            return resp == "s"
        print("Opção inválida. Digite apenas 's' ou 'n'.")


# ------------------------------------------
# apaga alguma coisa no caminho
def apagar(caminho):
    if os.path.isdir(caminho):
        shutil.rmtree(caminho, ignore_errors=True)
        print(f"Apagado: {caminho}")
    elif os.path.isfile(caminho):
        try:
            os.remove(caminho)
            print(f"Apagado: {caminho}")
        except FileNotFoundError:
            pass


# ------------------------------------------
# limpar e refazer todo migrate do django
if pergunta("Refazer o migrate do Django?"):
    print("Limpando sujeira anterior...")

    vaiApagar = [
        os.path.join(baseDir, "backpei", "backpei", "__pycache__"),
        os.path.join(baseDir, "backpei", "logs", "__pycache__"),
        os.path.join(baseDir, "backpei", "logs", "migrations", "__pycache__"),
        os.path.join(baseDir, "backpei", "logs", "migrations", "0001_initial.py"),
        os.path.join(baseDir, "backpei", "pei", "__pycache__"),
        os.path.join(baseDir, "backpei", "pei", "enums", "__pycache__"),
        os.path.join(baseDir, "backpei", "pei", "migrations", "__pycache__"),
        os.path.join(baseDir, "backpei", "pei", "migrations", "0001_initial.py"),
        os.path.join(baseDir, "backpei", "pei", "models", "__pycache__"),
        os.path.join(baseDir, "backpei", "pei", "services", "__pycache__"),
        os.path.join(baseDir, "backpei", "pei", "services", "migrations", "__pycache__"),
        os.path.join(baseDir, "backpei", "pei", "services", "serializers", "__pycache__"),
        os.path.join(baseDir, "backpei", "pei", "services", "views", "__pycache__"),
        os.path.join(baseDir, "backpei", "exportProDrive"),
    ]
    for item in vaiApagar:
        apagar(item)

    # vamos apagar o banco tambem?
    if pergunta("Deseja zerar o banco de dados?"):
        print("Zerando banco de dados...")
        apagar(os.path.join(baseDir, "backpei", "db.sqlite3"))

        roda([rodapy, os.path.join(baseDir, "backpei", "manage.py"), "makemigrations"])
        roda([rodapy, os.path.join(baseDir, "backpei", "manage.py"), "migrate"])
        roda([rodapy, os.path.join(baseDir, "backpei", "manage.py"), "showmigrations"])

        print("\n***********************************************\n")

        # ------------------------------------------
        # Criar superusuário do Django (somente manutenção)
        senhaAdmin = "PEIDev2IFRS"
        User.objects.create_superuser(username="administrador", password=senhaAdmin, email="")
        print(f"Conta 'administrador' criada com senha '{senhaAdmin}'.")

        # Criar token do superuser
        superuser = User.objects.get(username="administrador")
        super_token, _ = Token.objects.get_or_create(user=superuser)
        print(f"Token do superuser Django: {super_token.key}")

        # Salvar token em arquivo
        arquivoToken = os.path.join(baseDir, "backpei", "token.txt")
        with open(arquivoToken, "w") as f:
            f.write(super_token.key)

        # ------------------------------------------
        # Criar grupos e permissões
        grupos = {
            "Professor": [
                ("add_parecer", Parecer),
                ("change_documentocomplementar", DocumentacaoComplementar),
                ("change_peicentral", PeiCentral),
            ],
            "Pedagogo": [
                ("add_atadeacompanhamento", AtaDeAcompanhamento),
                ("change_peicentral", PeiCentral),
                ("change_documentocomplementar", DocumentacaoComplementar),
            ],
            "NAPNE": [
                ("add_peiperiodoletivo", PEIPeriodoLetivo),
                ("view_peicentral", PeiCentral),
                ("add_componentecurricular", ComponenteCurricular),
                ("change_peicentral", PeiCentral),
                ("add_atadeacompanhamento", AtaDeAcompanhamento),
                ("change_documentocomplementar", DocumentacaoComplementar),
            ],
            "Coordenador": [
                ("add_curso", Curso),
                ("add_disciplina", Disciplina),
                ("change_peicentral", PeiCentral),
                ("add_aluno", Aluno),
                ("add_atadeacompanhamento", AtaDeAcompanhamento),
                ("change_documentocomplementar", DocumentacaoComplementar),
            ],
            "Admin": [
                ("add_usuario", Usuario),
                ("add_curso", Curso),
                ("add_disciplina", Disciplina),
                ("change_peiperiodoletivo", PEIPeriodoLetivo),
                ("change_coordenadorcurso", Usuario),
                ("add_aluno", Aluno),
                ("change_peicentral", PeiCentral),
                ("add_parecer", Parecer),
                ("change_componentecurricular", ComponenteCurricular),
                ("add_atadeacompanhamento", AtaDeAcompanhamento),
                ("change_documentocomplementar", DocumentacaoComplementar),
            ],
        }

        for nome_grupo, perms in grupos.items():
            grupo, created = Group.objects.get_or_create(name=nome_grupo)
            for codename, model in perms:
                try:
                    ct = ContentType.objects.get_for_model(model)
                    permission = Permission.objects.get(codename=codename, content_type=ct)
                    grupo.permissions.add(permission)
                except Permission.DoesNotExist:
                    print(f"Permissão {codename} não encontrada para o modelo {model.__name__}")
            print(f"Grupo '{nome_grupo}' criado com permissões.")

        # ------------------------------------------
        # CRIAR ADMINISTRADOR REAL DO SISTEMA PEI
        admin_email = "2022012834@aluno.restinga.ifrs.edu.br"

        admin_user = User.objects.create(
            username=admin_email,
            email=admin_email,
            is_staff=True
        )
        admin_user.set_unusable_password()
        admin_user.save()

        # Criar registro Usuario
        Usuario.objects.create(
            user=admin_user,
            email=admin_email,
            nome="Administrador do Sistema",
            categoria_solicitada="Admin",
            aprovado=True
        )

        grupo_admin = Group.objects.get(name="Admin")
        admin_user.groups.add(grupo_admin)

        # Criar token do admin PEI
        admin_token, _ = Token.objects.get_or_create(user=admin_user)
        print(f"Token do administrador PEI: {admin_token.key}")

        # ------------------------------------------
        # popular banco
        if pergunta("Deseja popular o banco de dados com cadastros prévios?"):
            roda([rodapy, os.path.join(baseDir, "populaBanco.py")])
        else:
            print("O banco vai iniciar sem entradas pré cadastradas.")

    else:
        print("Banco de dados mantido.")
        roda([rodapy, os.path.join(baseDir, "backpei", "manage.py"), "makemigrations"])
        roda([rodapy, os.path.join(baseDir, "backpei", "manage.py"), "migrate"])
        roda([rodapy, os.path.join(baseDir, "backpei", "manage.py"), "showmigrations"])

else:
    print("Mantendo todos os dados.")


# ------------------------------------------
# printando versoes de tudo e finalizando
print("\n***********************************************\n")
print(f"Diretório de trabalho: {baseDir}")
roda([rodapy, '--version'])
roda([rodapy, '-m', 'pip', '--version'])
print(f"Django - {django.get_version()}")
print(f"Django REST Framework - {rest_framework.__version__}")


# ------------------------------------------
# levanta o webserver do django
roda([rodapy, os.path.join(baseDir, "backpei", "manage.py"), "runserver"])
