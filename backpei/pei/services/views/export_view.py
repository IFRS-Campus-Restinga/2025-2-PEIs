import io
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
from google.oauth2 import service_account
from googleapiclient.errors import HttpError

# Escopo: permite upload de arquivos
SCOPES = ["https://www.googleapis.com/auth/drive.file"]
SERVICE_ACCOUNT_FILE = "backpei/credentials.json"

class ExportarView(APIView):
  parser_classes = (MultiPartParser, FormParser)

  def post(self, request):
    try:
      file_obj = request.data["file"]

      creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES
      )

      service = build("drive", "v3", credentials=creds)
      file_metadata = {"name": file_obj.name}
      media = MediaIoBaseUpload(file_obj, mimetype="application/pdf")

      uploaded_file = service.files().create(
        body=file_metadata,
        media_body=media,
        fields="id, name, webViewLink"
      ).execute()

      return Response({
        "message": "Arquivo enviado com sucesso!",
        "id": uploaded_file.get("id"),
        "name": uploaded_file.get("name"),
        "link": uploaded_file.get("webViewLink"),
      })
    
    except HttpError as error:
      return Response({"error": f"Ocorreu um erro no Google Drive: {error}"}, status=500)
    except Exception as e:
      return Response({"error": str(e)}, status=500)