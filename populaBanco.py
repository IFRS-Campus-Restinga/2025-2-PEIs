import os
import django
import sys
from datetime import date, timedelta
import random

# ------------------------------------------------------------------------------
# SETUP DJANGO
# ------------------------------------------------------------------------------
baseDir = os.path.abspath(os.getcwd())
sys.path.append(os.path.join(baseDir, "backpei"))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backpei.settings')
django.setup()

# ------------------------------------------------------------------------------
# IMPORTS
# ------------------------------------------------------------------------------
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from pei.models.aluno import Aluno
from pei.models.ataDeAcompanhamento import AtaDeAcompanhamento
from pei.models.disciplina import Disciplina
from pei.models.curso import Curso
from pei.models.pei_central import PeiCentral
from pei.models.PEIPeriodoLetivo import PEIPeriodoLetivo
from pei.models.parecer import Parecer
from pei.models.componenteCurricular import ComponenteCurricular
from pei.enums.nivel import Nivel
from pei.enums import StatusDoPei, PeriodoLetivoChoice, CategoriaUsuario

User = get_user_model()

# ------------------------------------------------------------------------------
# UTILS
# ------------------------------------------------------------------------------

def limpar_tudo():
    print("Apagando dados antigos...")

    Parecer.objects.all().delete()
    ComponenteCurricular.objects.all().delete()
    PEIPeriodoLetivo.objects.all().delete()
    PeiCentral.objects.all().delete()
    Curso.objects.all().delete()
    Disciplina.objects.all().delete()
    Aluno.objects.all().delete()
    User.objects.exclude(username="administrador").delete()

    Group.objects.all().delete()

    print("--> Banco limpo\n")


# ------------------------------------------------------------------------------
# GRUPOS E USUÁRIOS
# ------------------------------------------------------------------------------

GRUPOS = ["Admin", "Pedagogo", "Professor", "Coordenador"]

def criar_grupos():
    for g in GRUPOS:
        Group.objects.get_or_create(name=g)
    print("--> Grupos criados")


def criar_usuario(nome, email, categoria):
    """
    Cria um CustomUser com grupo, categoria e aprovado=True.
    """

    username = email.split("@")[0].replace(".", "_").lower()

    user = User.objects.create_user(
        username=username,
        email=email,
        categoria=categoria,
        aprovado=True,
    )
    user.set_unusable_password()
    user.save()

    grupo = Group.objects.get(name=categoria.title())
    user.groups.add(grupo)

    # admin é especial
    if categoria == CategoriaUsuario.ADMIN:
        user.is_staff = True
        user.is_superuser = True
        user.save()

    return user


def criar_usuarios():
    print("--> Criando usuários...")

    criar_usuario("Administrador", "admin@ifrs.edu.br", CategoriaUsuario.ADMIN)

    professores = [
        ("Carlos Andrade", "carlos.andrade@ifrs.edu.br"),
        ("Fernanda Lima", "fernanda.lima@ifrs.edu.br"),
        ("Rafael Souza", "rafael.souza@ifrs.edu.br"),
        ("Juliana Torres", "juliana.torres@ifrs.edu.br"),
    ]

    coordenadores = [
        ("Jampier Brunetto", "jbrunetto@restinga.ifrs.edu.br"),
        ("Eduardo Ramos", "eduardo.ramos@ifrs.edu.br"),
    ]

    pedagogos = [
        ("Maria Pedagoga", "maria.pedagoga@ifrs.edu.br"),
        ("João Pedagogo", "joao.pedagogo@ifrs.edu.br"),
    ]

    for nome, email in professores:
        criar_usuario(nome, email, CategoriaUsuario.PROFESSOR)

    for nome, email in coordenadores:
        criar_usuario(nome, email, CategoriaUsuario.COORDENADOR)

    for nome, email in pedagogos:
        criar_usuario(nome, email, CategoriaUsuario.PEDAGOGO)

    print("--> Usuários criados!")


# ------------------------------------------------------------------------------
# ALUNOS / DISCIPLINAS / CURSOS
# ------------------------------------------------------------------------------

def criar_alunos():
    nomes = [
        "Lucas Silva", "Mariana Costa", "João Pereira", "Bruna Oliveira", "Felipe Santos", "Aline Rocha",
        "Gustavo Mendes", "Heloísa Lima", "Igor Almeida", "Júlia Fernandes", "Kevin Ribeiro", "Laura Martins",
        "Miguel Nunes", "Natália Pires", "Otávio Guedes", "Paula Xavier", "Quirino Barbosa", "Raquel Dantas"
    ]

    alunos_criados = []
    i = 0

    for nome in nomes:
        aluno = Aluno.objects.create(
            nome=nome,
            matricula=f"202300{i+1}",
            email=f"{nome.replace(' ', '.').lower()}@restinga.ifrs.edu.br"
        )
    print("--> Alunos criados")


def criar_disciplinas():
    nomes = [
        'Matemática Aplicada', 'Programação Web', 'Banco de Dados',
        'Redes de Computadores', 'Engenharia de Software',
        'Sistemas Operacionais'
    ]

    for nome in nomes:
        Disciplina.objects.create(nome=nome)

    print("--> Disciplinas criadas")


def criar_cursos():
    coordenadores = list(User.objects.filter(groups__name="Coordenador"))
    disciplinas = list(Disciplina.objects.all())

    nomes = [
        "Engenharia de Software",
        "Técnico em Informática",
    ]

    niveis = [Nivel.SUPERIOR, Nivel.MEDIO]

    # dividir disciplinas entre os cursos
    metade = len(disciplinas) // 2
    disciplinas_eng = disciplinas[:metade]       # primeiras N disciplinas
    disciplinas_tec = disciplinas[metade:]       # últimas N disciplinas

    print(f"Disciplinas para Engenharia: {[d.nome for d in disciplinas_eng]}")
    print(f"Disciplinas para Técnico: {[d.nome for d in disciplinas_tec]}")

    cursos = []

    for i in range(2):
        curso = Curso.objects.create(
            nome=nomes[i],
            nivel=niveis[i],
            coordenador=coordenadores[i % len(coordenadores)]
        )

        if i == 0:
            curso.disciplinas.set(disciplinas_eng)
        else:
            curso.disciplinas.set(disciplinas_tec)

        cursos.append(curso)

    print("--> Cursos criados com disciplinas distintas")
    return cursos




# ------------------------------------------------------------------------------
# PEI / PERÍODO / COMPONENTES / PARECERES
# ------------------------------------------------------------------------------

def criar_pei_central():
    alunos = list(Aluno.objects.all())

    for aluno in alunos:
        PeiCentral.objects.create(
            aluno=aluno,
            historico_do_aluno="Aluno com bom desempenho acadêmico.",
            necessidades_educacionais_especificas="Requer apoio em atividades extensas.",
            habilidades="Boa capacidade de resolução de problemas.",
            dificuldades_apresentadas="Distração ocasional.",
            adaptacoes="Apoio pedagógico semanal.",
            status_pei=StatusDoPei.OPEN
        )

    print("--> PEI Central criado")


def criar_pei_periodo_letivo():
    peis = list(PeiCentral.objects.all())

    for i, pei in enumerate(peis):
        data_inicio = date.today() - timedelta(days=90)
        data_fim = data_inicio + timedelta(days=60)

        PEIPeriodoLetivo.objects.create(
            data_criacao=data_inicio,
            data_termino=data_fim,
            periodo=PeriodoLetivoChoice.SEMESTRE,
            pei_central=pei
        )

    print("--> Períodos letivos criados")


def criar_componentes_curriculares():
    disciplinas = list(Disciplina.objects.all())
    periodos = list(PEIPeriodoLetivo.objects.all())

    print("--> Criando componentes curriculares...")

    for i, disc in enumerate(disciplinas):
        periodo = periodos[i % len(periodos)]

        ComponenteCurricular.objects.create(
            objetivos="Desenvolver competências básicas.",
            conteudo_prog="1",
            metodologia="Aulas expositivas e práticas.",
            disciplinas=disc,
            periodo_letivo=periodo
        )

    print("--> Componentes curriculares criados")


def criar_pareceres():
    professores = list(User.objects.filter(groups__name="Professor"))
    componentes = list(ComponenteCurricular.objects.all())

    textos = [
        "Excelente desempenho.",
        "Evolução constante.",
        "Participativo.",
        "Pode melhorar entregas.",
        "Demonstra interesse.",
    ]

    for comp in componentes:
        Parecer.objects.create(
            componente_curricular=comp,
            professor=random.choice(professores),
            texto=random.choice(textos)
        )

    print("--> Pareceres criados")


# ------------------------------------------------------------------------------
# EXECUÇÃO GERAL
# ------------------------------------------------------------------------------

def rodar():
    limpar_tudo()
    criar_grupos()
    criar_usuarios()
    criar_alunos()
    criar_disciplinas()
    criar_cursos()
    criar_pei_central()
    criar_pei_periodo_letivo()
    criar_componentes_curriculares()
    criar_pareceres()

    print("\n--> Todos os dados foram criados com sucesso!")


if __name__ == '__main__':
    rodar()