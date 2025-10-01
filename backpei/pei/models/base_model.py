from django.db import models

class BaseModel(models.Model):
    class Meta:
        abstract = True
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