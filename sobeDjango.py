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

# ------------------------------------------
# popular o pei central com dados, POSSIVELMENTE OBSOLETO
"""
from pei.models.pei_central import PeiCentral
def populaPeiCentral():
    # criando algumas entradas
    peis = [
        {
        "historico_do_aluno": "O aluno apresentou bom desempenho acadêmico ao longo do período letivo, destacando-se em matemática e ciências. Sua dedicação e participação ativa em sala resultaram em notas consistentemente altas. Além disso, demonstrou excelente capacidade de trabalho em equipe e proatividade na busca por conhecimento extra. Seu futuro é promissor.",
        "necessidades_educacionais_especificas": "O aluno é surdo, necessário acompanhamento de interpretador",
        "habilidades": "O aluno demonstra afinidade com jogos e gamificação.",
        "dificuldades_apresentadas": "O aluno demonstrou hiperatividade e dificuldade em manter o foco",
        "adaptacoes": "Necessário abordagem com uso de jogos",
        "status_pei": "ABERTO",
        },
        {
        "historico_do_aluno": "A aluna manteve um desempenho acadêmico mediano, com variações entre disciplinas. Demonstrou grande interesse por artes e escrita criativa, mas apresentou notas baixas em física. É muito organizada com prazos e trabalhos, participando ativamente dos clubes de leitura e teatro.",
        "necessidades_educacionais_especificas": "Dislexia leve, necessitando de materiais com fonte de fácil leitura e mais tempo em avaliações escritas.",
        "habilidades": "Alta criatividade, excelente expressão escrita e boa comunicação interpessoal. Forte habilidade em análise de textos literários.",
        "dificuldades_apresentadas": "Dificuldade na decodificação de fórmulas e leitura de gráficos em matérias exatas. Lentidão na escrita manual.",
        "adaptacoes": "Permitir o uso de computador para a maioria dos trabalhos e avaliações. Usar esquemas visuais e cores para separar informações em textos longos.",
        "status_pei": "ABERTO",
        },
        {
        "historico_do_aluno": "O aluno apresentou desempenho satisfatório, com progressos notáveis no último trimestre. Inicialmente retraído, demonstrou maior confiança e melhora nas habilidades sociais após participar de um projeto de robótica. Seu maior interesse é por tecnologia e programação.",
        "necessidades_educacionais_especificas": "Transtorno do Espectro Autista (TEA) - Nível 1. Necessita de ambiente previsível e clareza nas instruções verbais.",
        "habilidades": "Grande raciocínio lógico, memória detalhada para fatos e dados técnicos. Habilidade excepcional em montagem e resolução de problemas que envolvem sequências.",
        "dificuldades_apresentadas": "Dificuldade em lidar com mudanças inesperadas de rotina. Pode ter sensibilidade a ruídos e ambientes muito movimentados.",
        "adaptacoes": "Fornecer um cronograma visual das atividades. Permitir o uso de fone de ouvido em momentos de alta estimulação sensorial. Instruções devem ser diretas e objetivas.",
        "status_pei": "ABERTO",
        },
    ]
    # agora insere as entradas no banco
    for item in peis:
        try:
            PeiCentral.objects.create(**item)
            print("PeiCentral inserido com sucesso!")
        except Exception as e:
            print(f"Erro ao inserir PeiCentral. Causa: {e}")
"""


print("\n****************************\n")


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
        # por fim adicionando entradas necessarias
        # chamando o script do jampier que popula o banco
        roda([rodapy, os.path.join(baseDir, "populaBanco.py")])
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
