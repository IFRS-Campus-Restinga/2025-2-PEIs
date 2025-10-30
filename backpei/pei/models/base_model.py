from django.db import models
<<<<<<< HEAD
from django.forms.models import model_to_dict
import json
from logs.models import Log
from django.core.exceptions import ValidationError
from ..validators.relationship_validator import RelationshipValidator
=======
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d

class BaseModel(models.Model):
    class Meta:
        abstract = True
<<<<<<< HEAD

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
            validator(self)  # Chama o validador antes de excluir
            super().delete(*args, **kwargs)
        except ValidationError as e:
            # Repassa a exceção para o DRF tratar
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
            detalhes_completos={
                "antes": safe_old,
                "depois": {},
            }
        )

        super().delete(*args, **kwargs)
=======
        app_label = 'pei'
    
    def save(self, *args, **kwargs):
        # valida se é criacao ou atualizacao
        is_new = self.pk is None
        # faz o save
        super().save(*args, **kwargs)
        from logs.models import Log
        model_name = self.__class__.__name__
        #localiza um campo representativo (nome, titulo, etc)
        display_field = self._get_display_field()
        
        if is_new:
            acao = f"Criação de {model_name}"
            if display_field.startswith("ID "):
                detalhes = f"{model_name} criado (ID: {self.pk})"
            else:
                detalhes = f"{model_name} criado: {display_field} (ID: {self.pk})"
        else:
            acao = f"Atualização de {model_name}"
            if display_field.startswith("ID "):
                detalhes = f"{model_name} atualizado (ID: {self.pk})"
            else:
                detalhes = f"{model_name} atualizado: {display_field} (ID: {self.pk})"
        
        Log.objects.create(
            acao=acao,
            detalhes=detalhes
        )
    
    def _get_display_field(self):

        """
        Tenta encontrar um campo representativo do objeto.
        Busca por ordem de prioridade: nome, titulo, descricao, ou usa o ID.
        """
        for field in ['nome', 'name', 'autor', 'titulo', 'title', 'descricao', 'description', 'texto']:
            if hasattr(self, field):
                value = getattr(self, field)
                if value:
                    return value
        return f"ID {self.pk}"
    
    def delete(self, *args, **kwargs):
        from logs.models import Log
        
        model_name = self.__class__.__name__
        display_field = self._get_display_field()
        pk = self.pk
        super().delete(*args, **kwargs)

        if display_field.startswith("ID "):
            detalhes = f"{model_name} excluído (ID: {pk})"
        else:
            detalhes = f"{model_name} excluído: {display_field} (ID: {pk})"

        Log.objects.create(
        acao=f"Exclusão de {model_name}",
        detalhes=detalhes
        )
>>>>>>> 43901ff731fb63267482abcdd449d17dc21ff40d
