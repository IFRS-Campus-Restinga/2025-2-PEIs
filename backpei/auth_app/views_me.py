from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "email": user.email,
            "username": user.username,
            "grupos": list(user.groups.values_list("name", flat=True)),
            "categoria": user.categoria,
            "foto": user.foto,
        })
