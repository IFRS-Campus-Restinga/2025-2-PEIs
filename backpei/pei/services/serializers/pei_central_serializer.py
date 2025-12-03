from rest_framework import serializers
from pei.models.pei_central import PeiCentral
from pei.services.serializers.PEIPeriodoLetivo_serializer import PEIPeriodoLetivoSerializer
from pei.models.aluno import Aluno
from pei.models.componenteCurricular import ComponenteCurricular
from .aluno_serializer import AlunoSerializer
from .disciplina_serializer import DisciplinaSerializer
from .curso_serializer import CursoSerializer
from .componenteCurricular_serializer import ComponenteCurricularSerializer


class PeiCentralSerializer(serializers.ModelSerializer):
    periodos = PEIPeriodoLetivoSerializer(many=True, read_only=True)
    aluno = AlunoSerializer(read_only=True)
    aluno_id = serializers.PrimaryKeyRelatedField(
        queryset=Aluno.objects.all(), source="aluno", write_only=True
    )
    aluno_nome = serializers.CharField(source="aluno.nome", read_only=True)

    disciplinas = serializers.SerializerMethodField()
    cursos = serializers.SerializerMethodField()
    componentes_curriculares = serializers.SerializerMethodField()

    class Meta:
        model = PeiCentral
        fields = '__all__'

    def get_disciplinas(self, obj):
        if obj.aluno and obj.aluno.curso:
            # pega todas as disciplinas do curso do aluno
            return DisciplinaSerializer(obj.aluno.curso.disciplinas.all(), many=True).data
        return []
    
    def get_cursos(self, obj):
        if obj.aluno and obj.aluno.curso:
            # retorna o curso completo do aluno, incluindo coordenador
            return CursoSerializer(obj.aluno.curso).data
        return None
    
    def get_componentes_curriculares(self, obj):
        if obj.aluno and obj.aluno.curso:
            # pega todos os componentes do curso do aluno
            componentes = ComponenteCurricular.objects.filter(
                disciplinas__in=obj.aluno.curso.disciplinas.all()
            )
            return ComponenteCurricularSerializer(componentes, many=True).data
        return []