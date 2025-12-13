from django.contrib import admin, messages
from django.utils import timezone
from django.utils.crypto import get_random_string

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.mail import send_mail
from django.db import transaction

from .models.PEIPeriodoLetivo import PEIPeriodoLetivo
from .models.parecer import Parecer
from .models.pei_central import PeiCentral
from .models.curso import Curso
from .models.disciplina import Disciplina
from .models.aluno import Aluno
from .models.acompanhamento import Acompanhamento
#from .models.usuario import Usuario
from .models.componenteCurricular import ComponenteCurricular
from .models.CustomUser import CustomUser
from .models.conteudo import Conteudo
from .models.acompanhamento import Acompanhamento

admin.site.register((PEIPeriodoLetivo, Parecer, Curso, Disciplina, Aluno, PeiCentral, CustomUser, ComponenteCurricular, Conteudo, Acompanhamento))
