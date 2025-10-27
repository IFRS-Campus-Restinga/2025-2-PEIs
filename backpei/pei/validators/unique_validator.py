from django.core.exceptions import ValidationError
from django.apps import apps
from django.core.validators import BaseValidator

class UniqueValidator(BaseValidator):
    message = "O campo '{field}' com valor '{value}' já está em uso."

    def __init__(self, model_name, field_name, exclude_id=None, message=None):
        """
        model_name: 'app_label.ModelName'
        field_name: nome do campo a ser validado
        exclude_id: opcional, id para ignorar (em updates)
        message: mensagem customizada
        """
        super().__init__(limit_value=None, message=message)
        self.model_name = model_name
        self.field_name = field_name
        self.exclude_id = exclude_id

    def __call__(self, value):
        app_label, model_class_name = self.model_name.split('.')
        model = apps.get_model(app_label, model_class_name)
        qs = model.objects.filter(**{self.field_name: value})
        if self.exclude_id:
            qs = qs.exclude(id=self.exclude_id)
        if qs.exists():
            raise ValidationError(self.message.format(field=self.field_name, value=value))

    def deconstruct(self):
        """
        Permite que o Django serialize corretamente o validador nas migrations.
        """
        name = f"{self.__class__.__module__}.{self.__class__.__name__}"
        kwargs = {
            'model_name': self.model_name,
            'field_name': self.field_name,
        }
        if self.exclude_id is not None:
            kwargs['exclude_id'] = self.exclude_id
        if self.message != UniqueValidator.message:
            kwargs['message'] = self.message
        return (name, [], kwargs)