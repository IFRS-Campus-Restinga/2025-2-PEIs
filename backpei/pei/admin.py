from django.contrib import admin
from .models import *
from .models.PEIPeriodoLetivo import PEIPeriodoLetivo
from .models.parecer import Parecer
from .models.professor import Professor
from .models.pedagogo import Pedagogo



admin.site.register((Pessoa))
admin.site.register((PEIPeriodoLetivo))
admin.site.register((Parecer))
admin.site.register((Professor))
admin.site.register((Pedagogo))