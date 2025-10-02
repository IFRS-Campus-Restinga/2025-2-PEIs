from django.conf import settings

class AddBackendTokenHeaderMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        origin = request.META.get("HTTP_ORIGIN", "")
        # apenas injeta o token se a requisição veio do react (localhost:5173)
        if origin == "http://localhost:5173":
            request.META['HTTP_X_BACKEND_TOKEN'] = settings.API_TOKEN
        return self.get_response(request)