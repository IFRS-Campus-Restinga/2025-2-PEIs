from rest_framework import serializers
from pei.models import DocumentacaoComplementar

class DocumentacaoComplementarSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentacaoComplementar
        fields = '__all__'