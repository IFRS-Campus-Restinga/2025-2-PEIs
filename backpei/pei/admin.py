from django.contrib import admin

from .models.PEIPeriodoLetivo import PEIPeriodoLetivo
from .models.parecer import Parecer
from .models.pei_central import PeiCentral
from .models.curso import Curso
from .models.disciplina import Disciplina
from .models.aluno import Aluno
from .models.usuario import Usuario
from .models.componenteCurricular import ComponenteCurricular


# Admin personalizado para Usuario
@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ("nome", "email", "categoria", "status")
    list_filter = ("categoria", "status")
    search_fields = ("nome", "email")
    ordering = ("nome",)


admin.site.register(PEIPeriodoLetivo)
admin.site.register(Parecer)
admin.site.register(Curso)
admin.site.register(Disciplina)
admin.site.register(Aluno)
admin.site.register(PeiCentral)
admin.site.register(ComponenteCurricular)
