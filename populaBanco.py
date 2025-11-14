import os
import django
import sys
from datetime import date, timedelta

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
from django.contrib.auth.models import Group

# ============================================================================== 
# LIMPEZA INICIAL
# ============================================================================== 
def limpar_tudo():
    print("Apagando dados antigos...")
    Parecer.objects.all().delete()
    PEIPeriodoLetivo.objects.all().delete()
    PeiCentral.objects.all().delete()
    Curso.objects.all().delete()
    Disciplina.objects.all().delete()
    Aluno.objects.all().delete()
    Usuario.objects.all().delete()
    print("--> Banco limpo\n")

# ============================================================================== 
# FUNÇÃO PARA ADICIONAR USUÁRIO AO GRUPO
# ============================================================================== 
def adicionar_usuario_ao_grupo(usuario, categoria):
    nome_grupo = categoria.replace("_", " ").title()  
    try:
        grupo = Group.objects.get(name=nome_grupo)
        usuario.grupos.add(grupo)
        usuario.save()
    except Group.DoesNotExist:
        print(f"Grupo '{nome_grupo}' não encontrado para o usuário {usuario.email}")

# ============================================================================== 
# CRIAÇÃO DE USUÁRIOS POR CATEGORIA
# ============================================================================== 
def criar_usuarios_admin():
    emails = [
        "2022012656@aluno.restinga.ifrs.edu.br",
        "2022012487@aluno.restinga.ifrs.edu.br",
        "2023017316@aluno.restinga.ifrs.edu.br",
    ]

    for emailuser in emails:
        usuario = Usuario.objects.create(
            email=emailuser,
            nome=emailuser.split("@")[0],
            categoria=CategoriaUsuario.ADMIN
        )
        adicionar_usuario_ao_grupo(usuario, CategoriaUsuario.ADMIN)

    print("--> Admins criados e vinculados ao grupo")

def criar_pedagogos():
    nomes = ["Joãozinho da Silva", "Mariazinha Silveira", "Zézinho Silvano"]

    for nome in nomes:
        usuario = Usuario.objects.create(
            nome=nome,
            email=f"{nome.replace(' ', '.').lower()}@ifrs.edu.br",
            categoria=CategoriaUsuario.PEDAGOGO
        )
        adicionar_usuario_ao_grupo(usuario, CategoriaUsuario.PEDAGOGO)

    print("--> Pedagogos criados e vinculados ao grupo")

def criar_professores():
    nomes = [
        "Carlos Andrade", "Fernanda Lima", "Rafael Souza",
        "Juliana Torres", "Marcelo Cunha", "Patrícia Mendes"
    ]

    for nome in nomes:
        usuario = Usuario.objects.create(
            nome=nome,
            email=f"{nome.replace(' ', '.').lower()}@ifrs.edu.br",
            categoria=CategoriaUsuario.PROFESSOR
        )
        adicionar_usuario_ao_grupo(usuario, CategoriaUsuario.PROFESSOR)

    print("--> Professores criados e vinculados ao grupo")

def criar_coordenadores():
    nomes = [
        "Ana Beatriz", "Eduardo Ramos", "Sofia Martins",
        "Tiago Almeida", "Camila Ferreira", "Rodrigo Lopes"
    ]

    for nome in nomes:
        usuario = Usuario.objects.create(
            nome=nome,
            email=f"{nome.replace(' ', '.').lower()}@ifrs.edu.br",
            categoria=CategoriaUsuario.COORDENADOR
        )
        adicionar_usuario_ao_grupo(usuario, CategoriaUsuario.COORDENADOR)

    print("--> Coordenadores criados e vinculados ao grupo")

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
            matricula=f"2023000{i+1}",
            email=f"{nome.replace(' ', '.').lower()}@restinga.ifrs.edu.br"
        )
    print("--> Alunos criados")

def criar_disciplinas():
    nomes = [
        'Matemática Aplicada', 'Programação Web', 'Banco de Dados',
        'Redes de Computadores', 'Engenharia de Software',
        'Sistemas Operacionais', 'Inteligência Artificial',
        'Segurança da Informação', 'Desenvolvimento Mobile',
        'Design de Interfaces', 'Arquitetura de Computadores',
        'Algoritmos e Estruturas de Dados'
    ]

    for nome in nomes:
        Disciplina.objects.create(nome=nome)

    print("--> Disciplinas criadas")

def criar_cursos():
    coordenadores = list(Usuario.objects.filter(categoria=CategoriaUsuario.COORDENADOR))
    disciplinas = list(Disciplina.objects.all())

    nomes = [
        "Engenharia de Software", "Técnico em Informática", "Análise de Sistemas",
        "Ciência de Dados", "Segurança da Informação", "Desenvolvimento Mobile"
    ]

    niveis = [
        Nivel.SUPERIOR, Nivel.MEDIO, Nivel.SUPERIOR,
        Nivel.SUPERIOR, Nivel.MEDIO, Nivel.SUPERIOR
    ]

    for i in range(6):
        curso = Curso.objects.create(
            nome=nomes[i],
            nivel=niveis[i],
            coordenador=coordenadores[i]
        )
        curso.disciplinas.set([disciplinas[i], disciplinas[i + 1]])

    print("--> Cursos criados")

# ============================================================================== 
# PEI CENTRAL / PERÍODO LETIVO / PARECERES / COMPONENTES CURRICULARES
# ============================================================================== 
def criar_pei_central():
    alunos = list(Aluno.objects.all())
    status = [StatusDoPei.OPEN, StatusDoPei.INPROGRESS] * 3

    for i, aluno in enumerate(alunos):
        PeiCentral.objects.create(
            aluno=aluno,
            historico_do_aluno="Aluno com bom desempenho.",
            necessidades_educacionais_especificas="Necessita apoio.",
            habilidades="Boa lógica.",
            dificuldades_apresentadas="Concentração baixa.",
            adaptacoes="Tempo extra em provas.",
            status_pei=status[i]
        )

    print("--> PEI Central criado")

def criar_pei_periodo_letivo():
    peis = list(PeiCentral.objects.all())
    periodos = [PeriodoLetivoChoice.SEMESTRE, PeriodoLetivoChoice.BIMESTRE, PeriodoLetivoChoice.TRIMESTRE] * 2

    for i, pei in enumerate(peis):
        data_inicio = date.today() - timedelta(days=180 * (i + 1))
        data_fim = data_inicio + timedelta(days=150)

        PEIPeriodoLetivo.objects.create(
            data_criacao=data_inicio,
            data_termino=data_fim,
            periodo=periodos[i],
            pei_central=pei
        )

    print("--> PEI Períodos criados")

def criar_componentes_curriculares():
    ComponenteCurricular.objects.all().delete()
    disciplinas = list(Disciplina.objects.all())
    periodos = list(PEIPeriodoLetivo.objects.all())
    objetivos = [
        "Desenvolver pensamento lógico e crítico",
        "Aplicar conceitos de programação em projetos reais",
        "Compreender fundamentos de banco de dados",
        "Explorar redes de computadores e protocolos",
        "Estudar engenharia de software aplicada",
        "Dominar sistemas operacionais modernos"
    ]
    metodologias = [
        "Aulas expositivas e práticas em laboratório",
        "Projetos em grupo com uso de ferramentas ágeis",
        "Estudos de caso e resolução de problemas",
        "Simulações em rede e análise de tráfego",
        "Desenvolvimento orientado a testes",
        "Laboratórios com máquinas virtuais"
    ]

    for i in range(6):
        ComponenteCurricular.objects.create(
            objetivos=objetivos[i],
            conteudo_prog=str(i + 1),
            metodologia=metodologias[i],
            disciplinas=disciplinas[i],
            periodo_letivo=periodos[i]
        )
    print("--> Componentes curriculares criados")

def criar_pareceres():
    componentes = list(ComponenteCurricular.objects.all())  
    professores = list(Usuario.objects.filter(categoria=CategoriaUsuario.PROFESSOR))

    textos = [
        "Excelente desempenho.",
        "Mostrou evolução.",
        "Participativo.",
        "Precisa melhorar entregas.",
        "Demonstra interesse.",
        "Ótimo raciocínio lógico.",
    ]

    for i in range(6):
        Parecer.objects.create(
            componente_curricular=componentes[i],   
            professor=professores[i],               
            texto=textos[i]
        )

    print("--> Pareceres criados")

# ============================================================================== 
# EXECUÇÃO GERAL
# ============================================================================== 
def rodar():
    limpar_tudo()

    criar_usuarios_admin()
    criar_pedagogos()
    criar_professores()
    criar_coordenadores()

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
