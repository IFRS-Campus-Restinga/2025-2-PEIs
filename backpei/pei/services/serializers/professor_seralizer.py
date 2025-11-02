from rest_framework import serializers
from pei.models.professor import Professor


class ProfessorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Professor
        fields = '__all__'