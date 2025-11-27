from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group

User = get_user_model()

class UsuarioSerializer(serializers.ModelSerializer):
    grupos = serializers.SlugRelatedField(
        many=True,
        slug_field='name',
        queryset=Group.objects.all(),
        source="groups",
        required=False
    )
    permissoes = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'categoria', 'grupos', 'permissoes']
        read_only_fields = ['id', 'email']
        extra_kwargs = {
            "autor": {"required": False},
        }

    def get_permissoes(self, obj):
        return list(obj.get_all_permissions())