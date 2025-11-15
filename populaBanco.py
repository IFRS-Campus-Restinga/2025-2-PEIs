import os
import django
import sys
from datetime import date, timedelta
from random import choice, sample

# Preparação do ambiente -------------------------------------------------------
baseDir = os.path.abspath(os.getcwd())
sys.path.append(os.path.join(baseDir, "backpei"))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backpei.settings')
try:
    django.setup()
except Exception as e:
    print(f"Aviso: Não foi possível configurar o Django. Erro: {e}")

# Importação dos modelos --------------------------------------------------------
from pei.models import (
    Aluno, Disciplina, Curso,
    PeiCentral, PEIPeriodoLetivo, Parecer, Usuario, ComponenteCurricular
)
from pei.enums.nivel import Nivel
from pei.enums import StatusDoPei, PeriodoLetivoChoice, CategoriaUsuario
from django.contrib.auth.models import Group

# ==============================================================================
# CONFIGURAÇÃO DE QUANTIDADES
# ==============================================================================
NUM_PEIS = 18
NUM_COMPONENTES_POR_PEI = 3
NUM_PARECERES_POR_COMPONENTE = 1
NUM_CURSOS = 3
NUM_COORDENADORES = 3
NUM_DISCIPLINAS_POR_CURSO = 6
NUM_ALUNOS_POR_CURSO = 6
NUM_PROFESSORES = 6

# ==============================================================================
# LIMPEZA INICIAL
# ==============================================================================
def limpar_tudo():
    print("Apagando dados antigos...")
    for model in [Parecer, ComponenteCurricular, PEIPeriodoLetivo, PeiCentral, Aluno, Disciplina, Curso, Usuario]:
        model.objects.all().delete()
    print("--> Banco limpo\n")

# ==============================================================================
# ADICIONAR USUÁRIO AO GRUPO
# ==============================================================================
def adicionar_usuario_ao_grupo(usuario, categoria):
    nome_grupo = categoria.replace("_", " ").title()
    try:
        grupo = Group.objects.get(name=nome_grupo)
        usuario.grupos.add(grupo)
    except Group.DoesNotExist:
        pass  # Grupo será criado no admin

# ==============================================================================
# CRIAÇÃO DE USUÁRIOS
# ==============================================================================
def criar_usuarios_admin():
    emails = [
        "2022012656@aluno.restinga.ifrs.edu.br",
        "2022012487@aluno.restinga.ifrs.edu.br",
        "2023017316@aluno.restinga.ifrs.edu.br",
    ]
    for email in emails:
        usuario = Usuario.objects.create(
            email=email,
            nome=email.split("@")[0],
            categoria=CategoriaUsuario.ADMIN
        )
        adicionar_usuario_ao_grupo(usuario, CategoriaUsuario.ADMIN)
    print("--> Admins criados")

def criar_pedagogos():
    for nome in ["Joãozinho da Silva", "Mariazinha Silveira", "Zézinho Silvano"]:
        usuario = Usuario.objects.create(
            nome=nome,
            email=f"{nome.replace(' ', '.').lower()}@ifrs.edu.br",
            categoria=CategoriaUsuario.PEDAGOGO
        )
        adicionar_usuario_ao_grupo(usuario, CategoriaUsuario.PEDAGOGO)
    print("--> Pedagogos criados")

def criar_professores():
    nomes = ["Carlos Andrade", "Fernanda Lima", "Rafael Souza", "Juliana Torres", "Marcelo Cunha", "Patrícia Mendes"]
    for nome in nomes:
        usuario = Usuario.objects.create(
            nome=nome,
            email=f"{nome.replace(' ', '.').lower()}@ifrs.edu.br",
            categoria=CategoriaUsuario.PROFESSOR
        )
        adicionar_usuario_ao_grupo(usuario, CategoriaUsuario.PROFESSOR)
    print(f"--> {NUM_PROFESSORES} Professores criados")

def criar_coordenadores():
    nomes = ["Ana Beatriz", "Eduardo Ramos", "Sofia Martins"]
    for nome in nomes:
        usuario = Usuario.objects.create(
            nome=nome,
            email=f"{nome.replace(' ', '.').lower()}@ifrs.edu.br",
            categoria=CategoriaUsuario.COORDENADOR
        )
        adicionar_usuario_ao_grupo(usuario, CategoriaUsuario.COORDENADOR)
    print(f"--> {NUM_COORDENADORES} Coordenadores criados")

# ==============================================================================
# CURSOS + DISCIPLINAS + COORDENADORES
# ==============================================================================
def criar_cursos_e_disciplinas():
    cursos_data = [
        ("Engenharia de Software", Nivel.SUPERIOR),
        ("Técnico em Informática", Nivel.MEDIO),
        ("Ciência de Dados", Nivel.SUPERIOR),
    ]

    disciplinas_por_curso = [
        ["Programação Orientada a Objetos", "Engenharia de Software", "Banco de Dados Avançado",
         "Desenvolvimento Web Full Stack", "Estruturas de Dados", "Arquitetura de Software"],
        ["Programação Web", "Redes de Computadores", "Sistemas Operacionais",
         "Manutenção de Computadores", "Lógica de Programação", "Banco de Dados"],
        ["Estatística Aplicada", "Machine Learning", "Python para Dados",
         "Big Data", "Visualização de Dados", "Matemática para IA"]
    ]

    coordenadores = list(Usuario.objects.filter(categoria=CategoriaUsuario.COORDENADOR))
    cursos_criados = []

    for i, (nome_curso, nivel) in enumerate(cursos_data):
        curso = Curso.objects.create(
            nome=nome_curso,
            nivel=nivel,
            coordenador=coordenadores[i]
        )
        for nome_disc in disciplinas_por_curso[i]:
            disc = Disciplina.objects.create(nome=nome_disc)
            curso.disciplinas.add(disc)
        cursos_criados.append(curso)

    print(f"--> {NUM_CURSOS} Cursos criados com {NUM_DISCIPLINAS_POR_CURSO} disciplinas cada")
    return cursos_criados

# ==============================================================================
# ALUNOS
# ==============================================================================
def criar_alunos():
    nomes = [
        "Lucas Silva", "Mariana Costa", "João Pereira", "Bruna Oliveira", "Felipe Santos", "Aline Rocha",
        "Gustavo Mendes", "Heloísa Lima", "Igor Almeida", "Júlia Fernandes", "Kevin Ribeiro", "Laura Martins",
        "Miguel Nunes", "Natália Pires", "Otávio Guedes", "Paula Xavier", "Quirino Barbosa", "Raquel Dantas"
    ]

    alunos_criados = []
    matricula_counter = 1

    for nome in nomes:
        aluno = Aluno.objects.create(
            nome=nome,
            matricula=f"2023{matricula_counter:04d}",
            email=f"{nome.replace(' ', '.').lower()}@restinga.ifrs.edu.br",
        )
        alunos_criados.append(aluno)
        matricula_counter += 1

    print(f"--> {len(alunos_criados)} Alunos criados")
    return alunos_criados

# ==============================================================================
# PEI + PERÍODO + 3 COMPONENTES + 3 PARECERES
# ==============================================================================
def criar_pei_e_componentes(alunos, cursos):
    professores = list(Usuario.objects.filter(categoria=CategoriaUsuario.PROFESSOR))

    historicos = [
        "Aluno com histórico de bom desempenho acadêmico, demonstrando consistência em todas as disciplinas e participação ativa em projetos extracurriculares.",
        "Estudante dedicado com evolução notável ao longo do curso, superando desafios iniciais em áreas técnicas e desenvolvendo habilidades de liderança.",
        "Perfil de aluno proativo, com notas acima da média e contribuições significativas em trabalhos em grupo, mostrando potencial para carreira avançada.",
        "Histórico sólido com foco em inovação, participando de competições acadêmicas e demonstrando criatividade em soluções de problemas complexos.",
        "Aluno com trajetória de melhoria contínua, adaptando-se bem a metodologias modernas e mantendo equilíbrio entre estudos e atividades pessoais.",
        "Registro de excelência em disciplinas práticas, com ênfase em aplicação real de conhecimentos teóricos em projetos integradores."
    ]

    necessidades = [
        "Necessita de apoio adicional em leitura e compreensão de textos técnicos avançados para otimizar o aprendizado.",
        "Nenhuma necessidade educacional específica identificada, com desempenho independente em todas as áreas.",
        "Apoio recomendado em matemática aplicada e raciocínio lógico para reforçar bases em algoritmos e estruturas de dados.",
        "Dificuldade em manter concentração durante aulas longas, sugerindo estratégias de gestão de atenção e pausas programadas.",
        "Requer assistência em escrita acadêmica para melhorar a redação de relatórios e documentação de projetos.",
        "Apoio em comunicação oral para apresentações, visando aumentar a confiança em exposições públicas."
    ]

    habilidades = [
        "Boa capacidade de resolução de problemas complexos, utilizando lógica e análise sistemática.",
        "Criatividade e pensamento inovador, com habilidade para desenvolver soluções originais.",
        "Excelente comunicação oral e escrita, facilitando o trabalho em equipe e apresentação de ideias.",
        "Facilidade com trabalho em equipe, liderando grupos e resolvendo conflitos de forma eficaz.",
        "Alta proficiência em programação, com domínio de múltiplas linguagens e frameworks.",
        "Forte habilidade analítica, capaz de processar dados e extrair insights relevantes."
    ]

    dificuldades = [
        "Dificuldade em gerenciar prazos de projetos longos, levando a entregas de última hora.",
        "Baixa concentração em atividades teóricas extensas, afetando o desempenho em provas escritas.",
        "Procrastinação em tarefas complexas, adiando o início de atividades desafiadoras.",
        "Falta de organização nos estudos, resultando em perda de materiais e anotações.",
        "Dificuldade em equilibrar múltiplas disciplinas, sobrecarregando-se em períodos de pico.",
        "Desafio em aplicar teoria na prática, necessitando de mais exercícios hands-on."
    ]

    adaptacoes = [
        "Tempo extra concedido em avaliações para permitir revisão cuidadosa das respostas.",
        "Uso permitido de calculadora científica e ferramentas digitais em provas e exercícios.",
        "Nenhuma adaptação necessária, aluno demonstra independência total.",
        "Material didático fornecido em formato acessível, como fontes maiores e áudio suplementar.",
        "Aulas gravadas para revisão posterior, auxiliando em absorção de conteúdo.",
        "Apoio de tutor individual para disciplinas mais desafiadoras."
    ]

    objetivos_base = [
        "Desenvolver o pensamento lógico e crítico por meio de exercícios práticos e resolução de problemas reais, fomentando a capacidade de análise sistemática.",
        "Aplicar conceitos de programação avançada em projetos integrados e colaborativos, promovendo o uso de boas práticas de desenvolvimento.",
        "Compreender e modelar sistemas de bancos de dados relacionais e não relacionais, com ênfase em otimização e segurança.",
        "Explorar técnicas de análise de dados e visualização para tomada de decisões informadas em contextos reais.",
        "Estudar metodologias ágeis para desenvolvimento de software em equipe, incluindo Scrum e Kanban.",
        "Dominar conceitos de redes de computadores e segurança da informação, preparando para desafios cibernéticos atuais."
    ]

    metodologias_base = [
        "Aulas expositivas complementadas por laboratórios práticos e discussões em grupo, com foco em aplicação imediata.",
        "Projetos integradores em equipe com uso de ferramentas colaborativas como Git e plataformas de gerenciamento.",
        "Análise de estudos de caso reais da indústria, com apresentações, feedback e simulações interativas.",
        "Simulações virtuais e exercícios hands-on com software especializado para experimentação segura.",
        "Metodologia Scrum com sprints semanais, reuniões de review e retrospectivas para melhoria contínua.",
        "Aprendizagem baseada em problemas (PBL) com foco em soluções inovadoras e prototipagem rápida."
    ]

    textos_parecer = [
        "O aluno demonstrou excelente compreensão dos conceitos apresentados, participando ativamente das aulas e entregando todas as atividades no prazo. Seu raciocínio lógico é acima da média e apresenta grande potencial para projetos complexos, destacando-se em tarefas que exigem criatividade e inovação.",
        "Mostrou evolução significativa ao longo do período. Inicialmente com dificuldades em abstração, passou a resolver problemas mais complexos com autonomia. Recomenda-se continuidade no uso de exercícios práticos e participação em workshops para reforçar as habilidades adquiridas.",
        "Participativo, colaborativo e sempre disposto a ajudar colegas. Demonstrou domínio prático das ferramentas estudadas, especialmente em programação e depuração. Excelente trabalho em equipe, contribuindo para o sucesso coletivo em projetos grupais.",
        "Precisa melhorar a entrega de atividades no prazo. Embora domine a teoria, apresenta dificuldades na aplicação prática. Sugere-se maior dedicação aos laboratórios e uso do plantão de dúvidas para superar esses obstáculos e alcançar o potencial pleno.",
        "Apresenta interesse genuíno pela disciplina e busca constantemente desafios adicionais. Seus projetos foram criativos e bem documentados. Destaque para a iniciativa em pesquisa complementar, o que enriqueceu o aprendizado individual e coletivo.",
        "Ótimo raciocínio lógico e capacidade analítica. Concluiu todas as tarefas com qualidade superior à esperada. Recomenda-se participação em competições ou projetos de extensão para explorar ainda mais essas aptidões destacadas.",
        "Requer atenção individualizada em conceitos fundamentais. Apesar do esforço, ainda apresenta lacunas em temas básicos. Sugere-se reforço com material complementar e acompanhamento pedagógico para solidificar as bases e avançar com confiança.",
        "Progresso notável em relação ao início do período. Superou dificuldades iniciais com organização e passou a entregar trabalhos completos e bem estruturados. Parabéns pelo empenho e pela capacidade de adaptação demonstrada.",
        "Concluiu todas as tarefas com excelência, demonstrando domínio completo do conteúdo. Seus códigos são limpos, bem comentados e seguem boas práticas. Aluno com perfil de liderança técnica, ideal para papéis de destaque na área.",
        "Aluno dedicado, mas com dificuldade em expressar ideias por escrito. Recomenda-se prática de redação técnica e uso de ferramentas de apoio à escrita. O potencial técnico é evidente e pode ser maximizado com esse foco."
    ]

    total_componentes = 0
    total_pareceres = 0

    for i, aluno in enumerate(alunos):
        # === 1. PEI Central ===
        pei = PeiCentral.objects.create(
            aluno=aluno,
            historico_do_aluno=choice(historicos),
            necessidades_educacionais_especificas=choice(necessidades),
            habilidades=choice(habilidades),
            dificuldades_apresentadas=choice(dificuldades),
            adaptacoes=choice(adaptacoes),
            status_pei=choice([StatusDoPei.OPEN, StatusDoPei.INPROGRESS, StatusDoPei.CLOSED])
        )

        # === 2. Período Letivo ===
        data_inicio = date.today() - timedelta(days=180 * (i % 3 + 1))
        data_fim = data_inicio + timedelta(days=150)
        periodo = PEIPeriodoLetivo.objects.create(
            data_criacao=data_inicio,
            data_termino=data_fim,
            periodo=choice([PeriodoLetivoChoice.SEMESTRE, PeriodoLetivoChoice.BIMESTRE, PeriodoLetivoChoice.TRIMESTRE]),
            pei_central=pei
        )

        # === 3. 3 Componentes com disciplinas e professores diferentes ===
        curso = choice(cursos)  # Escolhe um curso aleatório para o PEI
        disciplinas_do_curso = list(curso.disciplinas.all())
        if len(disciplinas_do_curso) < NUM_COMPONENTES_POR_PEI:
            continue

        disc_sample = sample(disciplinas_do_curso, NUM_COMPONENTES_POR_PEI)
        prof_sample = sample(professores, NUM_COMPONENTES_POR_PEI)

        for j in range(NUM_COMPONENTES_POR_PEI):
            componente = ComponenteCurricular.objects.create(
                objetivos=choice(objetivos_base),
                conteudo_prog=f"Componente {j+1} do PEI {i+1}: Foco em conceitos fundamentais e aplicações práticas.",
                metodologia=choice(metodologias_base),
                disciplinas=disc_sample[j],
                periodo_letivo=periodo
            )
            total_componentes += 1

            # === 4. 1 Parecer por componente ===
            Parecer.objects.create(
                componente_curricular=componente,
                professor=prof_sample[j],
                texto=choice(textos_parecer)
            )
            total_pareceres += 1

    print(f"--> {NUM_PEIS} PEIs criados")
    print(f"--> {total_componentes} Componentes Curriculares criados (3 por PEI)")
    print(f"--> {total_pareceres} Pareceres criados (1 por componente)")

# ==============================================================================
# EXECUÇÃO GERAL
# ==============================================================================
def rodar():
    limpar_tudo()
    criar_usuarios_admin()
    criar_pedagogos()
    criar_professores()
    criar_coordenadores()
    cursos = criar_cursos_e_disciplinas()
    alunos = criar_alunos()
    criar_pei_e_componentes(alunos, cursos)
    print("\n--> Todos os dados foram criados com sucesso!")

if __name__ == '__main__':
    rodar()