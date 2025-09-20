from rest_framework import serializers
from pei.models import *


class DadosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pessoa
        fields = '__all__'