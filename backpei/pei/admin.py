from django.contrib import admin
from .models.PEIPeriodoLetivo import PEIPeriodoLetivo
from .models.parecer import Parecer
from .models.professor import Professor
from .models.pedagogo import Pedagogo
from .models.pei_central import PeiCentral
from .models.curso import Curso
from .models.disciplina import Disciplina
from .models.aluno import Aluno
from .models.coordenadorCurso import CoordenadorCurso

admin.site.register((Professor, PEIPeriodoLetivo, Parecer, Curso, Disciplina, Pedagogo, Aluno, CoordenadorCurso, PeiCentral))

