from django.contrib import admin
from .models import *
admin.site.register((Pessoa))
admin.site.register((ComponenteCurricular))
admin.site.register((AtaDeAcompanhamento))
admin.site.register((DocumentacaoComplementar))
from .models.PEIPeriodoLetivo import PEIPeriodoLetivo
from .models.parecer import Parecer
from .models.professor import Professor
from .models.pedagogo import Pedagogo
from .models.pei_central import PeiCentral

admin.site.register((Pessoa, Professor, PEIPeriodoLetivo, Parecer, Curso, Disciplina, Pedagogo, Aluno, CoordenadorCurso, PeiCentral))

