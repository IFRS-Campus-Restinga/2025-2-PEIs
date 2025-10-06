from rest_framework import serializers
from pei.models import *


class PedagogoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pedagogo
        fields = '__all__'