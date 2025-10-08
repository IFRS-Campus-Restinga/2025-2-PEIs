from django.db import models
from logs.models import Log

class BaseModel(models.Model):
    class Meta:
        abstract = True
        app_label = 'pei'
    
    def save(self, *args, **kwargs):
        # valida se é criacao ou atualizacao
        is_new = self.pk is None
        
        # para atualizações, salva o estado anterior, se for criação (nao conseguir) fica como none
        estado_anterior = None
        if not is_new:
            try:
                estado_anterior = self.__class__.objects.get(pk=self.pk)
                estado_anterior = self._serialize_object(estado_anterior)
            except:
                estado_anterior = None
        
        # faz o save
        super().save(*args, **kwargs)
        model_name = self.__class__.__name__
        
        # determina a ação
        if is_new:
            acao = "Criação"
        else:
            acao = "Atualização"
        
        # estado atual (após save)
        estado_atual = self._serialize_object(self)
        
        # cria o log com a nova estrutura, puxando agora os detalhes completos
        Log.objects.create(
            acao=acao,
            modelo=model_name,
            objeto_id=self.pk,
            detalhes_completos={
                'anterior': estado_anterior,
                'atual': estado_atual
            }
        )
    
    
    def _serialize_object(self, obj):
        """
        Serializa um objeto para JSON, incluindo todos os campos relevantes
        """
        data = {}
        for field in obj._meta.fields:
            value = getattr(obj, field.name)
            # Converte datetime para string
            if hasattr(value, 'isoformat'):
                data[field.name] = value.isoformat()
            else:
                data[field.name] = value
        return data
    
    def delete(self, *args, **kwargs):
        model_name = self.__class__.__name__
        
        # salva o estado anterior antes de deletar
        estado_anterior = self._serialize_object(self)
        
        # executa o delete
        super().delete(*args, **kwargs)
        
        # registra o log de exclusão
        Log.objects.create(
            acao="Exclusão",
            modelo=model_name,
            objeto_id=self.pk,
            detalhes_completos={
                'anterior': estado_anterior,
                'atual': None
            }
        )