from django.contrib import admin
from .models.PEIPeriodoLetivo import PEIPeriodoLetivo
from .models.parecer import Parecer
from .models.pei_central import PeiCentral
from .models.curso import Curso
from .models.disciplina import Disciplina
from .models.aluno import Aluno
from .models.usuario import Usuario
from .models.componenteCurricular import ComponenteCurricular

admin.site.register((PEIPeriodoLetivo, Parecer, Curso, Disciplina, Aluno, PeiCentral, Usuario, ComponenteCurricular))

