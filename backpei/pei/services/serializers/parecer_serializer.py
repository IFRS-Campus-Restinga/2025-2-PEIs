from rest_framework import serializers
from pei.models.parecer import Parecer
from pei.services.serializers.professor_seralizer import ProfessorSerializer
from pei.models.professor import Professor



class ParecerSerializer(serializers.ModelSerializer):
    professor = ProfessorSerializer(read_only=True)
    professor_id = serializers.PrimaryKeyRelatedField(
        queryset=Professor.objects.all(), source="professor", write_only=True
    ) 
    class Meta:
        model = Parecer
        fields = '__all__'