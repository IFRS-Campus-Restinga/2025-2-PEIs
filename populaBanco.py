import os
import django
import sys
from datetime import date, timedelta


# preparacao do ambiente
# ----------------------
baseDir = os.path.abspath(os.getcwd())
rodapy = os.path.join(baseDir, "python", "python.exe")
sys.path.append(os.path.join(baseDir, "backpei"))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backpei.settings')
django.setup()


# importacao dos modelos
# ----------------------
from pei.models import (
    Aluno, Professor, CoordenadorCurso, Disciplina, Curso, Pedagogo,
    PeiCentral, PEIPeriodoLetivo, ComponenteCurricular, Parecer, Usuario )
from pei.enums.nivel import Nivel
from pei.enums import StatusDoPei, PeriodoLetivoChoice, CategoriaUsuario


# apaga cursos
# ------------
def limpar_cursos():
    Curso.objects.all().delete()


# cadastro de usuarios
# ---------------------
def criar_usuarios():
    Usuario.objects.all().delete()
    emails = [ "2022012656@aluno.restinga.ifrs.edu.br",
               "2022012487@aluno.restinga.ifrs.edu.br",
               "2023017316@aluno.restinga.ifrs.edu.br", ]
    categorias = [ CategoriaUsuario.ADMIN,
                   CategoriaUsuario.ADMIN,
                   CategoriaUsuario.ADMIN, ]

    for i in range(3):
        Usuario.objects.create(email=emails[i], categoria=categorias[i])
    print("--> Usuarios criados")


# cadastro de pedagogos
# ---------------------
def criar_pedagogos():
    Pedagogo.objects.all().delete()
    nomes = [ "Joãozinho da Silva", "Mariazinha Silveira", "Zézinho Silvano" ]

    for item in nomes:
        Pedagogo.objects.create(nome=item)
    print("--> Pedagogos criados")


# cadastro de alunos
# ------------------
def criar_alunos():
    Aluno.objects.all().delete()
    nomes = [
        "Lucas Silva", "Mariana Costa", "João Pereira",
        "Bruna Oliveira", "Felipe Santos", "Aline Rocha" ]
    matriculas = ["20230001", "20230002", "20230003", "20230004", "20230005", "20230006"]
    emails = [
        "lucas.silva@restinga.ifrs.edu.br", "mariana.costa@restinga.ifrs.edu.br", "joao.pereira@restinga.ifrs.edu.br",
        "bruna.oliveira@restinga.ifrs.edu.br", "felipe.santos@restinga.ifrs.edu.br", "aline.rocha@restinga.ifrs.edu.br" ]

    for i in range(6):
        Aluno.objects.create(nome=nomes[i], matricula=matriculas[i], email=emails[i])
    print("--> Alunos criados")


# cadastro de professores
# -----------------------
def criar_professores():
    Professor.objects.all().delete()
    nomes = [
        "Carlos Andrade", "Fernanda Lima", "Rafael Souza",
        "Juliana Torres", "Marcelo Cunha", "Patrícia Mendes" ]
    matriculas = ["100001", "100002", "100003", "100004", "100005", "100006"]
    emails = [
        "carlos.andrade@restinga.ifrs.edu.br", "fernanda.lima@restinga.ifrs.edu.br", "rafael.souza@restinga.ifrs.edu.br",
        "juliana.torres@restinga.ifrs.edu.br", "marcelo.cunha@restinga.ifrs.edu.br", "patricia.mendes@restinga.ifrs.edu.br" ]

    for i in range(6):
        Professor.objects.create(nome=nomes[i], matricula=matriculas[i], email=emails[i])
    print("--> Professores criados")


# cadastro de coordenadores
# -------------------------
def criar_coordenadores():
    CoordenadorCurso.objects.all().delete()
    nomes = [
        "Ana Beatriz", "Eduardo Ramos", "Sofia Martins",
        "Tiago Almeida", "Camila Ferreira", "Rodrigo Lopes" ]

    for nome in nomes:
        CoordenadorCurso.objects.create(nome=nome)
    print("--> Coordenadores criados")


# cadastro de disciplinas
# -----------------------
def criar_disciplinas():
    Disciplina.objects.all().delete()
    nomes = [
        'Matemática Aplicada',
        'Programação Web',
        'Banco de Dados',
        'Redes de Computadores',
        'Engenharia de Software',
        'Sistemas Operacionais',
        'Inteligência Artificial',
        'Segurança da Informação',
        'Desenvolvimento Mobile',
        'Design de Interfaces',
        'Arquitetura de Computadores',
        'Algoritmos e Estruturas de Dados' ]
    for nome in nomes:
        Disciplina.objects.create(nome=nome)
    print("--> Disciplinas criadas")


# cadastro de cursos
# ------------------
def criar_cursos():
    coordenadores = list(CoordenadorCurso.objects.all())
    disciplinas = list(Disciplina.objects.all())
    nomes = [
        "Engenharia de Software",
        "Técnico em Informática",
        "Análise de Sistemas",
        "Ciência de Dados",
        "Segurança da Informação",
        "Desenvolvimento Mobile" ]
    niveis = [ Nivel.SUPERIOR, Nivel.MEDIO, Nivel.SUPERIOR, Nivel.SUPERIOR, Nivel.MEDIO, Nivel.SUPERIOR ]
    pares_de_disciplinas = [
        [disciplinas[4],disciplinas[5]],
        [disciplinas[0],disciplinas[1]],
        [disciplinas[2],disciplinas[3]],
        [disciplinas[10],disciplinas[11]],
        [disciplinas[6],disciplinas[7]],
        [disciplinas[8],disciplinas[9]] ]

    for i in range(6):
        curso = Curso.objects.create(
            name=nomes[i],
            nivel=niveis[i],
            coordenador=coordenadores[i] )
        curso.disciplinas.set(pares_de_disciplinas[i])
    print("--> Cursos criados")


# cadastro de pei central
# -----------------------
def criar_pei_central():
    PeiCentral.objects.all().delete()
    alunos = list(Aluno.objects.all())
    status = [StatusDoPei.OPEN, StatusDoPei.INPROGRESS] * 3

    for i in range(6):
        PeiCentral.objects.create(
            aluno=alunos[i],
            historico_do_aluno="Aluno com histórico de bom desempenho em disciplinas técnicas e humanas.",
            necessidades_educacionais_especificas="Necessita de apoio com leitura em braille e intérprete de Libras.",
            habilidades="Gosta de matemática, tem facilidade com lógica e programação.",
            dificuldades_apresentadas="Dificuldade de concentração em ambientes barulhentos.",
            adaptacoes="Uso de fones com cancelamento de ruído e tempo extra em provas.",
            status_pei=status[i] )
    print("--> PEI Central criado")


# cadastro de pei periodo letivo
# ------------------------------
def criar_pei_periodo_letivo():
    PEIPeriodoLetivo.objects.all().delete()
    peis = list(PeiCentral.objects.all())
    periodos = [PeriodoLetivoChoice.SEMESTRE, PeriodoLetivoChoice.BIMESTRE, PeriodoLetivoChoice.TRIMESTRE] * 2

    for i in range(6):
        data_inicio = date.today() - timedelta(days=180 * (i + 1))
        data_fim = data_inicio + timedelta(days=150)

        PEIPeriodoLetivo.objects.create(
            data_criacao=data_inicio,
            data_termino=data_fim,
            periodo=periodos[i],
            pei_central=peis[i] )
    print("--> PEI por periodo letivo criado")


# cadastro de componente curricular
# ---------------------------------
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
        "Dominar sistemas operacionais modernos" ]
    metodologias = [
        "Aulas expositivas e práticas em laboratório",
        "Projetos em grupo com uso de ferramentas ágeis",
        "Estudos de caso e resolução de problemas",
        "Simulações em rede e análise de tráfego",
        "Desenvolvimento orientado a testes",
        "Laboratórios com máquinas virtuais" ]

    for i in range(6):
        ComponenteCurricular.objects.create(
            objetivos=objetivos[i],
            conteudo_prog=str(i + 1),
            metodologia=metodologias[i],
            disciplinas=disciplinas[i],
            periodo_letivo=periodos[i] )
    print("--> Componentes curriculares criados")


# cadastro de parecer
# -------------------
def criar_pareceres():
    Parecer.objects.all().delete()
    componentes = list(ComponenteCurricular.objects.all())
    professores = list(Professor.objects.all())
    textos = [
        "O aluno demonstrou excelente desempenho nas atividades práticas.",
        "Houve dificuldade na compreensão dos conceitos teóricos, mas mostrou evolução.",
        "Participa ativamente das aulas e tem boa interação com os colegas.",
        "Precisa melhorar a entrega de trabalhos, mas tem boa participação.",
        "Demonstra interesse em aprender e busca ajuda quando necessário.",
        "Tem facilidade com lógica, mas precisa reforçar fundamentos teóricos." ]

    for i in range(6):
        Parecer.objects.create(
            componente_curricular=componentes[i],
            professor=professores[i],
            texto=textos[i] )
    print("--> Pareceres criados")


# area de execucao
# ----------------
def rodar():
    criar_usuarios()
    criar_pedagogos()
    criar_alunos()
    criar_professores()
    criar_disciplinas()
    limpar_cursos()
    criar_coordenadores()
    criar_cursos()
    criar_pei_central()
    criar_pei_periodo_letivo()
    criar_componentes_curriculares()
    criar_pareceres()
    print("--> Todos os dados foram criados com sucesso!")


# executa
# -------
if __name__ == '__main__':
    rodar()
