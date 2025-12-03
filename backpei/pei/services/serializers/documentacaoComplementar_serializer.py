from rest_framework import serializers
from pei.models.documentacaoComplementar import DocumentacaoComplementar

class DocumentacaoComplementarSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentacaoComplementar
        fields = '__all__'
        read_only_fields = ['usuario']