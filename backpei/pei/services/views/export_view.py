# services/views/export_view.py
import io
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
from google.oauth2.credentials import Credentials
from django.conf import settings

FOLDER_ID = "1oRe9RCLK8u6vSfctGr0weiel1T_UNlZM"

class ExportarView(APIView):
    def post(self, request):
        refresh_token = request.session.get('google_refresh_token')
        if not refresh_token:
            return Response({"error": "Faça login com Google primeiro"}, status=401)

        creds = Credentials(
            None,
            refresh_token=refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=settings.GOOGLE_CLIENT_ID,
            client_secret=settings.GOOGLE_CLIENT_SECRET,
            scopes=["https://www.googleapis.com/auth/drive.file"]
        )
        creds.refresh(requests.Request())

        service = build('drive', 'v3', credentials=creds)

        file_obj = request.data["file"]
        file_stream = io.BytesIO(file_obj.read())

        file_metadata = {"name": file_obj.name, "parents": [FOLDER_ID]}
        media = MediaIoBaseUpload(file_stream, mimetype="application/pdf")

        uploaded = service.files().create(
            body=file_metadata, media_body=media, fields="id,webViewLink"
        ).execute()

        return Response({
            "message": "Exportado com sucesso!",
            "link": uploaded.get("webViewLink")
        })