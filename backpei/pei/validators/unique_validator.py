# validador de unicidade em campo
from django.core.exceptions import ValidationError
from django.apps import apps
from .base import BaseValidator

class UniqueValidator(BaseValidator):
    # Valida se o valor de um campo já existe em outro registro.
    message = "O campo '{field}' com valor '{value}' já está em uso."

    def __init__(self, model_name, field_name, exclude_id=None, message=None):
        # Recebe o nome do model ("pei.Model") e o campo a verificar (ex: "email").
        #exclude_id serve para ignorar o registro atual (útil em updates).
        #Chama o __init__ da classe base para aproveitar o comportamento padrão.

        super().__init__(field_name, message)
        self.model_name = model_name
        self.exclude_id = exclude_id

    def __call__(self, value):
        #apps.get_model() permite buscar dinamicamente qualquer model Django pelo nome do app e do model.
        #Exemplo: "pei.Professor" → (app_label="pei", model_name="Professor").

        model = apps.get_model(*self.model_name.split('.'))  #"app.Model"
        query = model.objects.filter(**{self.field_name: value})
        if self.exclude_id:
            #Se estivermos editando um registro existente, ele será ignorado na verificação.
            #Assim, não dá falso positivo ao validar o próprio valor do registro.
            query = query.exclude(id=self.exclude_id)

        if query.exists():
            #Se já houver um registro com o mesmo valor, levanta o erro formatado.
            self.raise_error(field=self.field_name, value=value)
