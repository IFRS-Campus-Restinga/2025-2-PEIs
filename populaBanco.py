import os
import django
import sys
from datetime import date, timedelta
import random

# Preparação do ambiente -------------------------------------------------------
baseDir = os.path.abspath(os.getcwd())
sys.path.append(os.path.join(baseDir, "backpei"))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backpei.settings')
django.setup()

# Importação dos modelos --------------------------------------------------------
from pei.models import (
    Aluno, Disciplina, Curso,
    PeiCentral, PEIPeriodoLetivo, Parecer, Usuario, ComponenteCurricular
)
from pei.enums.nivel import Nivel
from pei.enums import StatusDoPei, PeriodoLetivoChoice, CategoriaUsuario

# ============================================================================== 
# LIMPEZA INICIAL
# ============================================================================== 
def limpar_tudo():
    print("Apagando dados antigos...")
    Parecer.objects.all().delete()
    ComponenteCurricular.objects.all().delete()
    PEIPeriodoLetivo.objects.all().delete()
    PeiCentral.objects.all().delete()
    Curso.objects.all().delete()
    Disciplina.objects.all().delete()
    Aluno.objects.all().delete()
    print("--> Banco limpo\n")

# ============================================================================== 
# USUÁRIOS (SEM VINCULAR A DJANGO USER)
# ============================================================================== 
def criar_usuarios_fake():
    """
    Cria usuários apenas na tabela Usuario (solicitantes),
    sem criar Users do Django — apenas para alimentar FK de coordenadores e professores.
    """

for g in GRUPOS:
    Group.objects.get_or_create(name=g)

# -----------------------------
# Criar usuário e associar grupo
# -----------------------------
def criar_usuario(nome, email, grupo_nome):
    grupo_nome = grupo_nome.title()  # Admin, Professor, ...
    categoria = grupo_nome.upper()   # ADMIN, PROFESSOR...

    # username deve ser único → usa o email como base
    username = email.split("@")[0].replace(".", "_").lower()

    # cria o usuário
    user = User.objects.create_user(
        username=username,
        email=email,
        categoria=categoria,             # <-- importantíssimo
        aprovado=True                    # populabanco marca todos como aprovados
    )
    user.set_unusable_password()

    # flags administrativas
    if grupo_nome == "Admin":
        user.is_staff = True
        user.is_superuser = True
    else:
        user.is_staff = False
        user.is_superuser = False

    user.save()

    # associa ao grupo
    grupo = Group.objects.get(name=grupo_nome)
    user.groups.add(grupo)

    return user

# -----------------------------
# Criar usuários por categoria
# -----------------------------
def criar_usuarios_admin():
    emails = [
        "2022012656@aluno.restinga.ifrs.edu.br",
        "2022012487@aluno.restinga.ifrs.edu.br",
        "2023017316@aluno.restinga.ifrs.edu.br",
    ]

    pedagogos = [
        ("Maria Pedagoga", "maria.pedagoga@ifrs.edu.br", CategoriaUsuario.PEDAGOGO),
        ("João Pedagogo", "joao.pedagogo@ifrs.edu.br", CategoriaUsuario.PEDAGOGO),
    ]

    professores = [
        ("Carlos Andrade", "carlos.andrade@ifrs.edu.br", CategoriaUsuario.PROFESSOR),
        ("Fernanda Lima", "fernanda.lima@ifrs.edu.br", CategoriaUsuario.PROFESSOR),
        ("Rafael Souza", "rafael.souza@ifrs.edu.br", CategoriaUsuario.PROFESSOR),
        ("Juliana Torres", "juliana.torres@ifrs.edu.br", CategoriaUsuario.PROFESSOR),
    ]

    coordenadores = [
        ("Ana Beatriz", "ana.beatriz@ifrs.edu.br", CategoriaUsuario.COORDENADOR),
        ("Eduardo Ramos", "eduardo.ramos@ifrs.edu.br", CategoriaUsuario.COORDENADOR),
    ]

    todos = admins + pedagogos + professores + coordenadores

    for nome, email, categoria in todos:
        Usuario.objects.create(
            nome=nome,
            email=email,
            aprovado=True,
            categoria_solicitada=categoria
        )

    print("--> Usuários criados (apenas Usuario, sem Django User)")

# ============================================================================== 
# ALUNOS / DISCIPLINAS / CURSOS
# ============================================================================== 
def criar_alunos():
    nomes = [
        "Lucas Silva", "Mariana Costa", "João Pereira",
        "Bruna Oliveira", "Felipe Santos", "Aline Rocha"
    ]

    for i, nome in enumerate(nomes):
        Aluno.objects.create(
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
    coordenadores = list(Usuario.objects.filter(categoria_solicitada=CategoriaUsuario.COORDENADOR))
    disciplinas = list(Disciplina.objects.all())

    nomes = [
        "Engenharia de Software",
        "Técnico em Informática",
    ]

    niveis = [Nivel.SUPERIOR, Nivel.MEDIO]

    for i in range(2):
        curso = Curso.objects.create(
            nome=nomes[i],
            nivel=niveis[i],
            coordenador=coordenadores[i % len(coordenadores)]
        )

        curso.disciplinas.set(disciplinas[:3])

    print("--> Cursos criados")

# ============================================================================== 
# PEI CENTRAL / PERÍODO LETIVO / PARECERES / COMPONENTES CURRICULARES
# ============================================================================== 
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

    # Cada disciplina só pode ter UM componente curricular (unique constraint)
    # Então vamos limitar 1 componente por disciplina e distribuir pelos períodos.

    if not periodos:
        print("Nenhum período letivo encontrado!")
        return

    print("--> Criando componentes curriculares...")

    for i, disc in enumerate(disciplinas):
        periodo = periodos[i % len(periodos)]  # distribui entre os períodos

        ComponenteCurricular.objects.create(
            objetivos="Desenvolver competências básicas.",
            conteudo_prog="1",
            metodologia="Aulas expositivas e práticas.",
            disciplinas=disc,              # ForeignKey UNIQUE
            periodo_letivo=periodo
        )

    print("--> Componentes curriculares criados sem duplicações (OK)")


def criar_pareceres():
    professores = list(Usuario.objects.filter(categoria_solicitada=CategoriaUsuario.PROFESSOR))
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

# -----------------------------
# Remover permissões individuais
# -----------------------------
def limpar_permissoes_individuais():
    for u in User.objects.all():
        u.user_permissions.clear()

        if not u.groups.filter(name="Admin").exists():
            u.is_staff = False
            u.is_superuser = False

        u.save()

    print("--> Permissões individuais limpas")

# -----------------------------
# Execução geral
# -----------------------------
def rodar():
    limpar_tudo()

    criar_usuarios_fake()         # NÃO cria Django User
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
