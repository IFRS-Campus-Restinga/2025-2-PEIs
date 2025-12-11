import os
import django
import sys
from datetime import date, timedelta
import random
from random import choice

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

# Após setup()
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from rest_framework.authtoken.models import Token
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth import get_user_model
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
from pei.enums import StatusDoPei, PeriodoLetivoChoice, CategoriaUsuario
from pei.enums.nivel import Nivel

User = get_user_model()

# ==============================================================================
# UTILITÁRIOS
# ==============================================================================

def limpar_tudo():
    print("🧹 Apagando dados antigos...")

    Parecer.objects.all().delete()
    ComponenteCurricular.objects.all().delete()
    PEIPeriodoLetivo.objects.all().delete()
    PeiCentral.objects.all().delete()
    Curso.objects.all().delete()
    Disciplina.objects.all().delete()
    Aluno.objects.all().delete()
    User.objects.exclude(username="administrador").delete()

    print("✔ Banco limpo!\n")

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
            ("add_parecer", Parecer),
            ("change_componentecurricular", ComponenteCurricular),
            ("add_componentecurricular", ComponenteCurricular),
            ("add_atadeacompanhamento", AtaDeAcompanhamento),
            ("change_documentocomplementar", DocumentacaoComplementar),
            ("add_documentocomplementar", DocumentacaoComplementar),
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


# ==============================================================================
# USUÁRIOS
# ==============================================================================

def criar_usuario(nome, email, grupo_nome):
    # Cria usuário
    user = User.objects.create_user(username=nome, email=email)
    user.set_unusable_password()
    user.nome = nome 
    user.categoria = grupo_nome.upper()
    user.save()
    user.aprovado = True

    # Associa ao grupo correto
    grupo, _ = Group.objects.get_or_create(name=grupo_nome.title())
    user.groups.add(grupo)

    # Remove todas as permissões individuais
    user.user_permissions.clear()

    # Define superuser e staff apenas para o grupo Admin
    if grupo_nome.lower() == "admin":
        user.is_superuser = True
        user.is_staff = True
    else:
        user.is_superuser = False
        user.is_staff = False

    user.save()
    return user

def criar_admin_master():
    """
    Admin principal: ALTERE AQUI CASO QUEIRA SER CADASTRADO COMO ADMIN → 2023017316@aluno.restinga.ifrs.edu.br
    """
    email = "2022012834@aluno.restinga.ifrs.edu.br"
    nome = "Admin_Master"

    existente = User.objects.filter(email=email).first()
    if existente:
        print(f"Admin Master já existe: {email}")
        return existente

    user = criar_usuario(nome, email, "admin")
    print(f"Admin Master criado: {email}")
    return user


def criar_pedagogos():
    nomes = ["Joãozinho da Silva", "Mariazinha Silveira", "Zézinho Silvano"]
    for nome in nomes:
        email = f"{nome.replace(' ', '.').lower()}@ifrs.edu.br"
        criar_usuario(nome, email, "Pedagogo")
    print("--> Pedagogos criados")

def criar_professores():
    nomes = [
        "Gabriel Lisboa Costa", "Fernanda Lima", "Rafael Souza",
        "Juliana Torres", "Marcelo Cunha", "Patrícia Mendes"
    ]
    for nome in nomes:
        email = f"{nome.replace(' ', '.').lower()}@ifrs.edu.br"
        criar_usuario(nome, email, "Professor")
    print("--> Professores criados")

def criar_coordenadores():
    nomes = [
        "Ana Beatriz", "Eduardo Ramos", "Sofia Martins",
        "Tiago Almeida", "Camila Ferreira", "Rodrigo Lopes"
    ]
    for nome in nomes:
        email = f"{nome.replace(' ', '.').lower()}@ifrs.edu.br"
        criar_usuario(nome, email, "Coordenador")
    print("--> Coordenadores criados")


# ==============================================================================
# ALUNOS / DISCIPLINAS / CURSOS
# ==============================================================================

def criar_alunos():
    print("--> Criando alunos...")

    nomes = [
        "Lucas Silva", "Mariana Costa", "João Pereira",
        "Bruna Oliveira", "Felipe Santos", "Aline Rocha",
    ]

    cursos = list(Curso.objects.all())
    if not cursos:
        print("Nenhum curso encontrado. Crie cursos antes de criar alunos.")
        return

    for i, nome in enumerate(nomes):
        curso_escolhido = choice(cursos)  
        Aluno.objects.create(
            nome=nome,
            matricula=f"202300{i+1}",
            email=f"{nome.replace(' ', '.').lower()}@restinga.ifrs.edu.br",
            curso=curso_escolhido
        )
        print(f"Aluno {nome} vinculado ao curso {curso_escolhido.nome}")

    print("Todos os alunos criados")


def criar_disciplinas():
    nomes = [
        'Matemática Aplicada', 'Programação Web', 'Banco de Dados',
        'Redes de Computadores', 'Engenharia de Software',
        'Sistemas Operacionais'
    ]

    for nome in nomes:
        Disciplina.objects.create(nome=nome)

    print("✔ Disciplinas criadas")


def criar_cursos():
    coordenadores = list(User.objects.filter(groups__name="Coordenador"))
    disciplinas = list(Disciplina.objects.all())

    nomes = ["Engenharia de Software", "Técnico em Informática"]
    niveis = [Nivel.SUPERIOR, Nivel.MEDIO]

    metade = len(disciplinas) // 2
    disciplinas_eng = disciplinas[:metade]
    disciplinas_tec = disciplinas[metade:]

    cursos = []

    for i in range(2):
        curso = Curso.objects.create(
            nome=nomes[i],
            nivel=niveis[i],
            coordenador=coordenadores[i % len(coordenadores)]
        )

        curso.disciplinas.set(disciplinas_eng if i == 0 else disciplinas_tec)
        cursos.append(curso)

    print("Cursos criados com disciplinas distintas")
    return cursos


# ==============================================================================
# PEI / PERÍODO / COMPONENTES / PARECERES
# ==============================================================================

def criar_pei_central():
    alunos = list(Aluno.objects.all())

    for aluno in alunos:
        PeiCentral.objects.create(
            aluno=aluno,
            historico_do_aluno="Aluno com bom desempenho acadêmico.",
            necessidades_educacionais_especificas="Requer apoio pedagógico.",
            habilidades="Boa capacidade de resolução de problemas.",
            dificuldades_apresentadas="Distração ocasional.",
            adaptacoes="Apoio pedagógico semanal.",
            status_pei=StatusDoPei.OPEN
        )

    print("PEI Central criado")


def criar_pei_periodo_letivo():
    peis = list(PeiCentral.objects.all())

    for pei in peis:
        data_inicio = date.today() - timedelta(days=90)
        data_fim = data_inicio + timedelta(days=60)

        PEIPeriodoLetivo.objects.create(
            data_criacao=data_inicio,
            data_termino=data_fim,
            periodo=PeriodoLetivoChoice.SEMESTRE,
            pei_central=pei
        )

    print("Períodos letivos criados")


def criar_componentes_curriculares():
    disciplinas = list(Disciplina.objects.all())
    periodos = list(PEIPeriodoLetivo.objects.all())

    for i, disc in enumerate(disciplinas):
        periodo = periodos[i % len(periodos)]

        componente = ComponenteCurricular.objects.create(
            objetivos="Objetivos do componente.",
            conteudo_prog="1",
            metodologia="Metodologia padrão.",
            disciplinas=disc
        )

        componente.periodos_letivos.add(periodo)

    print("Componentes curriculares criados")



def criar_pareceres():
    professores = list(User.objects.filter(groups__name="Professor"))
    componentes = list(ComponenteCurricular.objects.all())

    textos = [
        "Excelente desempenho.",
        "Evolução constante.",
        "Participativo.",
        "Pode melhorar entregas.",
        "Demonstra interesse."
    ]

    for comp in componentes:
        Parecer.objects.create(
            componente_curricular=comp,
            professor=random.choice(professores),
            texto=random.choice(textos)
        )

    print("Pareceres criados")


# ==============================================================================
# EXECUÇÃO GERAL
# ==============================================================================

def rodar():
    limpar_tudo()
    criar_admin_master()      
    criar_pedagogos()
    criar_professores()
    criar_coordenadores()
    criar_disciplinas()
    criar_cursos()
    criar_alunos()
    criar_pei_central()
    criar_pei_periodo_letivo()
    criar_componentes_curriculares()
    criar_pareceres()

    print("\n Todos os dados foram criados com sucesso!")

    # -----------------------------
    # Teste para ver permissões do usuário
    # -----------------------------
    print("\n================= TESTANDO PERMISSÕES =================\n")

    # Escolher um usuário de cada grupo
    testes = {
        "Professor": User.objects.filter(groups__name="Professor").first(),
        "Pedagogo": User.objects.filter(groups__name="Pedagogo").first(),
        "Coordenador": User.objects.filter(groups__name="Coordenador").first(),
        "Admin": User.objects.filter(groups__name="Admin").first(),
    }

    for grupo, user in testes.items():
        print(f"\n--- {grupo.upper()} ---")
        print("Usuário:", user.username)
        print("email:", user.email)

        print("is_superuser:", user.is_superuser)
        print("is_staff:", user.is_staff)

        print("Grupo(s):", [g.name for g in user.groups.all()])

        print("Permissões individuais:", user.user_permissions.count())

        print("Permissões vindas do grupo:")
        for perm in user.get_group_permissions():
            print("   •", perm)

        print("TODAS permissões (user + grupo):")
        for perm in user.get_all_permissions():
            print("   →", perm)


if __name__ == '__main__':
    rodar()