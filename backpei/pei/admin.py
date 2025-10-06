from django.contrib import admin
from .models import *
from .models.pei_periodo_letivo import PEIPeriodoLetivo
from .models.parecer import Parecer
from .models.professor import Professor
from .models.pedagogo import Pedagogo
from .models.pei_central import PeiCentral

admin.site.register((Pessoa, Professor, PEIPeriodoLetivo, Parecer, Curso, Disciplina, Pedagogo, Aluno, CoordenadorCurso, PeiCentral))

