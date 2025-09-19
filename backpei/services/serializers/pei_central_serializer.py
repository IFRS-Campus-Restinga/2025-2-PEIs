from rest_framework import serializers
from pei.models import *

class PeiCentralSerializer(serializers.ModelSerializer):
    class Meta:
        model = PeiCentral
        fields = '__all__'