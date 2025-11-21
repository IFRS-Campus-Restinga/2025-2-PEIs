from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from django.apps import apps
from django.db.models.fields.related import ForeignKey, ManyToManyField

class ModelSchemaView(ViewSet):

    def list(self, request):
        models = apps.get_app_config("pei").get_models()
        names = [m._meta.object_name for m in models]

        return Response({
            "available_models": names,
            "detail_url_example": "/services/schema/Aluno/"
        })

    def retrieve(self, request, pk=None):
        model_name = pk

        # Tenta pegar o model exatamente como foi passado
        try:
            model = apps.get_model("pei", model_name)
        except LookupError:
            return Response({"error": "Modelo não encontrado"}, status=404)

        fields = []

        for field in model._meta.get_fields():

            # Ignora Reverse relations (ex: aluno.parecer_set)
            if field.auto_created and not field.concrete:
                continue

            field_info = {
                "name": field.name,
                "type": field.get_internal_type(),
                "required": not getattr(field, "null", False),
            }

            # --- FOREIGN KEY ---
            if isinstance(field, ForeignKey):
                field_info["type"] = "select"
                field_info["related_model"] = field.related_model._meta.object_name

            # --- MANY TO MANY ---
            if isinstance(field, ManyToManyField):
                field_info["type"] = "multiselect"
                field_info["related_model"] = field.related_model._meta.object_name

            fields.append(field_info)

        return Response({
            "model": model_name,
            "fields": fields
        })
