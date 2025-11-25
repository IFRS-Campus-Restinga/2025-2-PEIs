from django.apps import apps
from django.core.serializers.json import DjangoJSONEncoder
from django.forms.models import model_to_dict
from django.db.models import ForeignKey, OneToOneField, ManyToManyField

def get_model_schema(model_name):
    model = apps.get_model("pei", model_name) 
    if not model:
        return None

    fields_schema = []

    for field in model._meta.get_fields():
        field_info = {
            "name": field.name,
            "type": field.get_internal_type(),
            "required": not field.null,
        }

        # Se for FK, OneToOne ou ManyToMany, informar o modelo relacionado
        if hasattr(field, "related_model") and field.related_model:
            field_info["relation"] = field.related_model.__name__

        fields.append(field_info)

        # Campos de texto
        if hasattr(field, "max_length") and field.max_length:
            field_info["max_length"] = field.max_length

        # Validações
        if hasattr(field, "validators"):
            validators = []
            for v in field.validators:
                validators.append(str(v))
            field_info["validators"] = validators

        # ForeignKey / OneToOne → retorna lista de opções
        if isinstance(field, (ForeignKey, OneToOneField)):
            related_model = field.related_model
            field_info["relation"] = related_model.__name__

            # opções
            field_info["choices"] = [
                {"id": obj.id, "label": str(obj)}
                for obj in related_model.objects.all()
            ]

        fields_schema.append(field_info)

    return {
        "model": model_name,
        "fields": fields_schema
    }