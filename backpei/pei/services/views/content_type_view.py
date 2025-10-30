# backpei/pei/services/views/contenttype_view.py
from django.contrib.contenttypes.models import ContentType
from rest_framework.views import APIView
from rest_framework.response import Response

class ContentTypeListView(APIView):
    def get(self, request):
        model = request.GET.get('model')
        if not model:
            return Response([], status=200)
        content_types = ContentType.objects.filter(model=model)
        data = [{"id": ct.id, "model": ct.model, "app_label": ct.app_label} for ct in content_types]
        return Response(data)