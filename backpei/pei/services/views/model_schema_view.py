from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from django.apps import apps
from django.db.models.fields.related import ForeignKey, ManyToManyField
from django.db.models import FileField


# MAPEAMENTO ENTRE MODELS E ENDPOINTS REAIS
ENDPOINT_MAP = {
    "CustomUser": "usuario",
    "Conteudo": "conteudo",
    "Parecer": "parecer",
    "Curso": "cursos",
    "Aluno": "aluno",
    "PeiCentral": "pei_central",
    "PEIPeriodoLetivo": "PEIPeriodoLetivo",
    "Disciplina": "disciplinas",
    "ComponenteCurricular": "componenteCurricular",
    "AtaDeAcompanhamento": "ataDeAcompanhamento",
    "DocumentacaoComplementar": "documentacaoComplementar",
    "Notificacao": "notificacoes",
}


class ModelSchemaView(ViewSet):

    def list(self, request):
        base_url = "http://localhost:8080/services/"
        models = apps.get_app_config("pei").get_models()

        output = {}

        for model in models:
            model_name = model._meta.object_name
            if model_name in ENDPOINT_MAP:
                endpoint = ENDPOINT_MAP[model_name]
                output[endpoint] = f"{base_url}{endpoint}/"

        output["schema"] = f"{base_url}schema/"
        return Response(output)

    def retrieve(self, request, pk=None):
        try:
            model = apps.get_model("pei", pk)
        except LookupError:
            return Response({"error": "Modelo não encontrado"}, status=404)

        fields = []

        for field in model._meta.get_fields():

            # ignora reverse relations
            if field.auto_created and not field.concrete:
                continue

            info = {
                "name": field.name,
                "required": not getattr(field, "null", False),
            }

            # ------------------------
            # FILE FIELD
            # ------------------------
            if isinstance(field, FileField):
                info["type"] = "file"

            # ------------------------
            # CHOICES
            # ------------------------
            elif getattr(field, "choices", None):
                info["type"] = "select"
                info["choices"] = [
                    {"value": c[0], "label": c[1]} for c in field.choices
                ]

            # ------------------------
            # FOREIGN KEY
            # ------------------------
            elif isinstance(field, ForeignKey):
                info["type"] = "select"
                info["related_model"] = field.related_model._meta.object_name

                # 🔥 Ajuste: serializer usa <campo>_id
                info["name"] = f"{field.name}_id"

            # ------------------------
            # MANY TO MANY
            # ------------------------
            elif isinstance(field, ManyToManyField):
                info["type"] = "multiselect"
                info["related_model"] = field.related_model._meta.object_name

            # ------------------------
            # CAMPOS SIMPLES
            # ------------------------
            else:
                info["type"] = field.get_internal_type()

            fields.append(info)

        return Response({
            "model": pk,
            "fields": fields
        })
