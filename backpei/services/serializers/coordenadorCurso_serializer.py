from rest_framework import serializers
from pei.models.coordenadorCurso import CoordenadorCurso


class CoordenadorCursoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoordenadorCurso
        fields = '__all__'