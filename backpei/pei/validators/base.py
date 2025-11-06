# validador base, outros validadores irão herdar este 
from django.core.exceptions import ValidationError

class BaseValidator:
    #Classe base para todos os validadores.
    message = "O valor fornecido é inválido."
    code = "invalid"

    def __init__(self, field_name=None, message=None):
        if message:
            self.message = message
        self.field_name = field_name

    def raise_error(self, **context):
        #Levanta um ValidationError com mensagem amigável.
        raise ValidationError(
            self.message.format(**context),
            code=self.code
        )

    def __call__(self, value):
        #Deve ser implementado nas subclasses.
        raise NotImplementedError
