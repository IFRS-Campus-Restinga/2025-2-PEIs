from django.apps import apps
from django.core.exceptions import ValidationError
from django.db import models

class RelationshipValidator:
    
    #Verifica se um objeto possui relações com outros modelos.
    #Impede a exclusão caso existam registros relacionados.
    

    def __init__(self, message=None):
        self.message = message or "Não é possível excluir este registro, pois ele está vinculado a outros dados."

    def __call__(self, instance):
        
        #Executa a verificação antes da exclusão.
        #Recebe a instância que se deseja excluir.
        
        related_objects = []
        
        # Percorre todos os relacionamentos do modelo
        for rel in instance._meta.related_objects:
            related_model = rel.related_model
            accessor_name = rel.get_accessor_name()

            # Exemplo: aluno.peicentral_set.all()
            related_manager = getattr(instance, accessor_name)

            # Verifica se há registros vinculados
            if related_manager.exists():
                related_objects.append(related_model._meta.verbose_name_plural.title())

        if related_objects:
            model_name = instance._meta.verbose_name.title()
            related_list = ", ".join(related_objects)
            raise ValidationError(
                f"Não é possível excluir o(a) {model_name} porque ele está vinculado a(o): {related_list}."
            )

