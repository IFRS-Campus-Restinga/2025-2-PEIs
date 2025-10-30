from django.contrib import admin
<<<<<<< HEAD
from .models.PEIPeriodoLetivo import PEIPeriodoLetivo
=======
from .models import *
from .models.pei_periodo_letivo import PEIPeriodoLetivo
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d
from .models.parecer import Parecer
from .models.professor import Professor
from .models.pedagogo import Pedagogo
from .models.pei_central import PeiCentral
from .models.curso import Curso
from .models.disciplina import Disciplina
from .models.aluno import Aluno
from .models.coordenadorCurso import CoordenadorCurso
from .models.usuario import Usuario

admin.site.register((Professor, PEIPeriodoLetivo, Parecer, Curso, Disciplina, Pedagogo, Aluno, CoordenadorCurso, PeiCentral, Usuario))

