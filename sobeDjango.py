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
# e com isso ja poderemos fazer coisas no proprio projeto
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token


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
        print("Opcao invalida. Digite apenas 's' ou 'n'.")


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


print("\n****************************\n")


# ------------------------------------------
# limpar e refazer todo migrate do django
if pergunta("Refazer o migrate do Django?"):
    print("Limpando sujeira anterior...")
    vaiApagar = [
        os.path.join(baseDir, "backpei", "backpei", "__pycache__"),
        os.path.join(baseDir, "backpei", "pei", "__pycache__"),
        os.path.join(baseDir, "backpei", "pei", "migrations", "__pycache__"),
        os.path.join(baseDir, "backpei", "pei", "migrations", "0001_initial.py"),
        os.path.join(baseDir, "backpei", "pei", "models", "__pycache__"),
        os.path.join(baseDir, "backpei", "services", "__pycache__"),
        os.path.join(baseDir, "backpei", "services", "migrations", "__pycache__"),
        os.path.join(baseDir, "backpei", "services", "serializers", "__pycache__"),
        os.path.join(baseDir, "backpei", "services", "views", "__pycache__"),
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
        print(f"\n***********************************************\n")
        # agora precisamos criar novamente a conta de administrador
        senhaAdmin = "PEIDev2IFRS"
        User.objects.create_superuser(username="administrador", password=senhaAdmin, email="")
        print(f"Conta \"administrador\" criada com senha \"{senhaAdmin}\".")
        # tambem gerar novamente o token do administrador
        user = User.objects.get(username="administrador")
        token, created = Token.objects.get_or_create(user=user)
        print(f"Token do administrador: {token.key}")
        # esse token controla nosso acesso ao rest, salvando na pasta do projeto
        arquivoToken = os.path.join(baseDir, "backpei", "token.txt")
        with open(arquivoToken, "w") as f:
            f.write(token.key)
    else:
        print("Banco de dados mantido.")
        roda([rodapy, os.path.join(baseDir, "backpei", "manage.py"), "makemigrations"])
        roda([rodapy, os.path.join(baseDir, "backpei", "manage.py"), "migrate"])
        roda([rodapy, os.path.join(baseDir, "backpei", "manage.py"), "showmigrations"])
else:
    print("Mantendo todos os dados.")


# ------------------------------------------
# printando versoes de tudo e finalizando
print(f"\n***********************************************\n")
print(f"Diretorio de trabalho: {baseDir}")
roda([rodapy,'--version'])
roda([rodapy,'-m','pip','--version'])
print(f"Django - {django.get_version()}")
print(f"Django REST Framework - {rest_framework.__version__}")

# ------------------------------------------
# levanta o webserver do django
roda([rodapy, os.path.join(baseDir, "backpei", "manage.py"), "runserver"])