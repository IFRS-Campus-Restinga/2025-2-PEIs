import os
import shutil
import subprocess
import sys
import django
import rest_framework
from django.contrib.auth import get_user_model


# ------------------------------------------
# Diretório base do projeto
baseDir = os.path.abspath(os.getcwd())
rodapy = os.path.join(baseDir, "python", "python.exe")

# Python da venv atual
rodapy = sys.executable

# ------------------------------------------
# Configuração Django
sys.path.append(os.path.join(baseDir, "backpei"))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backpei.settings")
django.setup()

# Após setup()
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from rest_framework.authtoken.models import Token
from django.contrib.contenttypes.models import ContentType

# Importar modelos usados em permissões
from pei.models.pei_central import PeiCentral
from pei.models.PEIPeriodoLetivo import PEIPeriodoLetivo
from pei.models.componenteCurricular import ComponenteCurricular
from pei.models.aluno import Aluno
from pei.models.disciplina import Disciplina
from pei.models.curso import Curso
from pei.models.ataDeAcompanhamento import AtaDeAcompanhamento
from pei.models.CustomUser import CustomUser
from pei.models.parecer import Parecer
from pei.models.documentacaoComplementar import DocumentacaoComplementar

User = get_user_model()

# ------------------------------------------
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
        print("Digite apenas 's' ou 'n'.")


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
# Caminhos para limpar
default_paths_to_remove = [
    os.path.join(baseDir, "backpei", "backpei", "__pycache__"),
    os.path.join(baseDir, "backpei", "logs", "__pycache__"),
    os.path.join(baseDir, "backpei", "logs", "migrations", "__pycache__"),
    os.path.join(baseDir, "backpei", "pei", "__pycache__"),
    os.path.join(baseDir, "backpei", "pei", "migrations", "__pycache__"),
    os.path.join(baseDir, "backpei", "pei", "models", "__pycache__"),
    os.path.join(baseDir, "backpei", "pei", "services", "__pycache__"),
    os.path.join(baseDir, "backpei", "exportProDrive"),
]

# ------------------------------------------
if pergunta("Refazer migrations?"):
    print("\nLimpando arquivos temporários...\n")

    for p in default_paths_to_remove:
        apagar(p)

    # apagar initial migrations antigas
    apagar(os.path.join(baseDir, "backpei", "pei", "migrations", "0001_initial.py"))
    apagar(os.path.join(baseDir, "backpei", "logs", "migrations", "0001_initial.py"))

    if pergunta("Zerar o banco (db.sqlite3)?"):
        apagar(os.path.join(baseDir, "backpei", "db.sqlite3"))

    # Criar migrations da app PEI antes
    print("\nCriando migrations...\n")
    try:
        roda([rodapy, os.path.join(baseDir, "backpei", "manage.py"), "makemigrations", "pei"])
    except subprocess.CalledProcessError:
        print("Falha ao gerar migrations da app PEI. Continuando...")

    roda([rodapy, os.path.join(baseDir, "backpei", "manage.py"), "makemigrations"])
    roda([rodapy, os.path.join(baseDir, "backpei", "manage.py"), "migrate"])
    roda([rodapy, os.path.join(baseDir, "backpei", "manage.py"), "showmigrations"])

    # ------------------------------------------
    # Criar superusuário administrador
    print("\nCriando superusuário administrador...")

    senhaAdmin = "12345678"
    if not User.objects.filter(username="administrador").exists():
        admin = User.objects.create_superuser(
            username="administrador",
            email="",
            password=senhaAdmin,
        )
        print("Superusuário criado.")
    else:
        admin = User.objects.get(username="administrador")
        print("Superusuário já existe.")

    # Garantir grupo Admin
    grupo_admin, _ = Group.objects.get_or_create(name="Admin")
    if grupo_admin not in admin.groups.all():
        admin.groups.add(grupo_admin)
        admin.save()

    # Token do superuser
    token, _ = Token.objects.get_or_create(user=admin)
    with open(os.path.join(baseDir, "backpei", "token.txt"), "w") as f:
        f.write(token.key)

    print(f"Token salvo em token.txt: {token.key}")

    # ------------------------------------------
    # Grupos e permissões
    print("\nConfigurando grupos e permissões...\n")

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
            ("add_user", User),
            ("change_user", User),
            ("add_curso", Curso),
            ("add_disciplina", Disciplina),
            ("change_peiperiodoletivo", PEIPeriodoLetivo),
            ("add_aluno", Aluno),
            ("change_peicentral", PeiCentral),
            ("add_peicentral", PeiCentral),
            ("add_parecer", Parecer),
            ("change_parecer", Parecer),
            ("change_componentecurricular", ComponenteCurricular),
            ("add_componentecurricular", ComponenteCurricular),
            ("add_atadeacompanhamento", AtaDeAcompanhamento),
            ("change_documentocomplementar", DocumentacaoComplementar),
        ],
    }

    for nome_grupo, perm_list in grupos.items():
        grupo, _ = Group.objects.get_or_create(name=nome_grupo)
        for codename, model in perm_list:
            try:
                ct = ContentType.objects.get_for_model(model)
                perm = Permission.objects.get(codename=codename, content_type=ct)
                grupo.permissions.add(perm)
            except Permission.DoesNotExist:
                print(f"⚠ Permissão não encontrada: {codename} ({model.__name__})")
        print(f"Grupo configurado: {nome_grupo}")

    # ------------------------------------------
    # Popular o banco?
    if pergunta("\nDeseja rodar populaBanco.py?"):
        path = os.path.join(baseDir, "populaBanco.py")
        if os.path.exists(path):
            roda([rodapy, path])
        else:
            print("populaBanco.py não encontrado.")

else:
    print("\nMantendo banco. Apenas garantindo migrations.")
    roda([rodapy, os.path.join(baseDir, "backpei", "manage.py"), "makemigrations"])
    roda([rodapy, os.path.join(baseDir, "backpei", "manage.py"), "migrate"])
    roda([rodapy, os.path.join(baseDir, "backpei", "manage.py"), "showmigrations"])


# ------------------------------------------
# Informações & subir servidor
print("\n***********************************************")
print(f"DIR: {baseDir}")
roda([rodapy, "--version"])
print(f"instalando as dependências google")
#roda([rodapy, "-m", "pip", "install", "google-auth"])
#roda([rodapy, "-m", "pip", "install", "google-oauthlib"])
#roda([rodapy, "-m", "pip", "install", "google-auth-httplib2"])

roda([rodapy, "-m", "pip", "--version"])
print(f"Django - {django.get_version()}")
print(f"Django REST Framework - {rest_framework.__version__}")

print("\nSubindo servidor Django...\n")
roda([rodapy, os.path.join(baseDir, "backpei", "manage.py"), "runserver"])