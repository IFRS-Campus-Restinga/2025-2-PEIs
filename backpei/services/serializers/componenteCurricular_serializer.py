from rest_framework import serializers
from pei.models import ComponenteCurricular

class ComponenteCurricularSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComponenteCurricular
        fields = '__all__'