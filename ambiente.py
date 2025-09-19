import os
import shutil
import subprocess
import sys
import django
import rest_framework

# ------------------------------------------
# pegando nosso diretorio atual, vai valer onde está o script
# portanto deixe ele na pasta raiz de tudo, onde está python, node e os projetos
baseDir = os.path.abspath(os.getcwd())
rodapy = os.path.join(baseDir, "python", "python.exe")
rodanpm = os.path.join(baseDir, "node", "npm.cmd")

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
        os.path.join(baseDir, "backpei", "pei", "models", "__pycache__"),
        os.path.join(baseDir, "backpei", "services", "__pycache__"),
        os.path.join(baseDir, "backpei", "services", "migrations", "__pycache__"),
    ]
    for item in vaiApagar:
        apagar(item)
    # vamos apagar o banco tambem?
    if pergunta("Deseja zerar o banco de dados?"):
        print("Zerando banco de dados...")
        apagar(os.path.join(baseDir, "backpei", "db.sqlite3"))
    else:
        print("Banco de dados mantido.")
    # agora sim refazendo o migrate
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
print(f"Django - {django.get_version()}")
print(f"Django REST Framework - {rest_framework.__version__}")
roda([os.path.join(baseDir, "node", "node.exe"), "--version"])
roda([rodanpm, "--version"])
roda([rodanpm, "list", "vite"], cwd=os.path.join(baseDir, "frontpei"), ambiente={"PATH": f"{os.path.join(baseDir,'node')};{os.environ['PATH']}"})
roda([rodanpm, "list", "react"], cwd=os.path.join(baseDir, "frontpei"), ambiente={"PATH": f"{os.path.join(baseDir,'node')};{os.environ['PATH']}"})

# ------------------------------------------
# levantar django nesse terminal?
if pergunta("Deseja levantar o webserver do BACKEND (Django) nesse terminal?"):
    roda([rodapy, os.path.join(baseDir, "backpei", "manage.py"), "runserver"])

# ------------------------------------------
# levantar react nesse terminal?
if pergunta("Deseja levantar o webserver do FRONTEND (React) nesse terminal?"):
    roda([rodanpm, "run", "dev"], cwd=os.path.join(baseDir, "frontpei"), ambiente={"PATH": f"{os.path.join(baseDir,'node')};{os.environ['PATH']}"})


print("\n****************************")
print("** Ambiente carregado !!! **")
print("****************************\n")