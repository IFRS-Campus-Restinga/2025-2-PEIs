from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model
from rest_framework.permissions import AllowAny

class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        User = get_user_model()
        user, created = User.objects.get_or_create(email=email, defaults={"username": email})
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key})
