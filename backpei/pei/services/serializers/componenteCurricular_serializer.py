from rest_framework import serializers
from pei.models import ComponenteCurricular
from pei.services.serializers.parecer_serializer import ParecerSerializer

class ComponenteCurricularSerializer(serializers.ModelSerializer):
    pareceres = ParecerSerializer(many=True, read_only=True)
    class Meta:
        model = ComponenteCurricular
        fields = '__all__'