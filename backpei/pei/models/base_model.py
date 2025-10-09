from django.db import models
from django.forms.models import model_to_dict
import json

class BaseModel(models.Model):
    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        acao = "Criação" if self._state.adding else "Atualização"

        # Captura valores antigos e novos
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

        # Agora salva o log com dados serializáveis
        from logs.models import Log  # ou o caminho correto
        Log.objects.create(
            acao=acao,
            modelo=self.__class__.__name__,
            objeto_id=self.id,
            detalhes_completos={
                "antes": safe_old,
                "depois": safe_new,
            }
        )
