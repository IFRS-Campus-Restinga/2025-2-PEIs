from rest_framework import serializers
from pei.models import ComponenteCurricular
<<<<<<< HEAD
from pei.services.serializers.parecer_serializer import ParecerSerializer
from pei.services.serializers.disciplina_serializer import DisciplinaSerializer

class ComponenteCurricularSerializer(serializers.ModelSerializer):
    pareceres = ParecerSerializer(many=True, read_only=True)
    disciplina = DisciplinaSerializer(read_only=True, source="disciplinas")
=======

class ComponenteCurricularSerializer(serializers.ModelSerializer):
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d
    class Meta:
        model = ComponenteCurricular
        fields = '__all__'