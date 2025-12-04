from django.db import models
from django.forms.models import model_to_dict
import json
from logs.models import Log
from django.core.exceptions import ValidationError
from ..validators.relationship_validator import RelationshipValidator
# FUNÇÃO QUE PEGA O USUÁRIO DA THREAD (MIDDLEWARE)
from pei.services.middleware import get_current_user 

class BaseModel(models.Model):
    class Meta:
        abstract = True

    #  MÉTODO AUXILIAR PARA PEGAR QUEM ESTÁ LOGADO
    def _get_usuario_log(self):
        user = get_current_user()
        # Verifica se existe e se não é AnonymousUser
        if user and user.is_authenticated:
            return f"{user.id} - {user.username}"
        return "Sistema/Anônimo"

    def save(self, *args, **kwargs):
        acao = "Criação" if self._state.adding else "Atualização"

        old_values = {}
        if not self._state.adding:
            try:
                old = self.__class__.objects.get(pk=self.pk)
                old_values = model_to_dict(old)
            except self.__class__.DoesNotExist:
                pass

        new_values = model_to_dict(self)

        def safe_json(value):
            try:
                json.dumps(value)
                return value
            except TypeError:
                return str(value)

        safe_old = {k: safe_json(v) for k, v in old_values.items()}
        safe_new = {k: safe_json(v) for k, v in new_values.items()}

        super().save(*args, **kwargs)

        
        Log.objects.create(
            acao=acao,
            modelo=self.__class__.__name__,
            objeto_id=self.id,
            usuario=self._get_usuario_log(),
            detalhes_completos={
                "antes": safe_old,
                "depois": safe_new,
            }
        )

    def safe_delete(self, *args, **kwargs):
        """
        Método genérico que valida antes de excluir.
        """
        validator = RelationshipValidator()
        try:
            validator(self)
            super().delete(*args, **kwargs)
        except ValidationError as e:
            raise e

    def delete(self, *args, **kwargs):
        old_values = model_to_dict(self)

        def safe_json(value):
            try:
                json.dumps(value)
                return value
            except TypeError:
                return str(value)

        safe_old = {k: safe_json(v) for k, v in old_values.items()}

        
        Log.objects.create(
            acao="Exclusão",
            modelo=self.__class__.__name__,
            objeto_id=self.id,
            usuario=self._get_usuario_log(),
            detalhes_completos={
                "antes": safe_old,
                "depois": {},
            }
        )

        super().delete(*args, **kwargs)