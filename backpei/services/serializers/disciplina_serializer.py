from rest_framework import serializers
from pei.models import *

class DisciplinaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Disciplina
        fields = ['nome']