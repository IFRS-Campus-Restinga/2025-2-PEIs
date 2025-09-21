from django.contrib import admin
from .models import *

admin.site.register((Pessoa, Professor, PEIPeriodoLetivo, Parecer, Curso, Disciplina))