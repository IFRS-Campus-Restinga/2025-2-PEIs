from rest_framework import serializers
from pei.models.PEIPeriodoLetivo import PEIPeriodoLetivo
<<<<<<< HEAD
from pei.services.serializers.componenteCurricular_serializer import ComponenteCurricularSerializer


class PEIPeriodoLetivoSerializer(serializers.ModelSerializer): 
    componentes_curriculares = ComponenteCurricularSerializer(many=True, read_only=True)  
=======
from pei.services.serializers.parecer_serializer import ParecerSerializer


class PEIPeriodoLetivoSerializer(serializers.ModelSerializer):
    pareceres = ParecerSerializer(many=True, read_only=True)  
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d

    class Meta:
        model = PEIPeriodoLetivo
        fields = '__all__'