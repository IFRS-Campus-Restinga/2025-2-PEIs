import io
import traceback
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
from google.oauth2 import service_account
from googleapiclient.errors import HttpError

SCOPES = ["https://www.googleapis.com/auth/drive.file"]
SERVICE_ACCOUNT_FILE = "backpei/credentials.json"
FOLDER_ID = "1oRe9RCLK8u6vSfctGr0weiel1T_UNlZM"

class ExportarView(APIView):
    permission_classes = [AllowAny]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        try:
            file_obj = request.data["file"]

            creds = service_account.Credentials.from_service_account_file(
                SERVICE_ACCOUNT_FILE, scopes=SCOPES
            )

            service = build("drive", "v3", credentials=creds)

            # 🔹 Converte o InMemoryUploadedFile para bytes
            file_stream = io.BytesIO(file_obj.read())

            file_metadata = {
                "name": file_obj.name,
                "parents": [FOLDER_ID]
            }

            media = MediaIoBaseUpload(file_stream, mimetype="application/pdf")

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
            print("==== ERRO GOOGLE DRIVE ====")
            print(traceback.format_exc())
            return Response({"error": f"Ocorreu um erro no Google Drive: {error}"}, status=500)

        except Exception as e:
            print("==== ERRO GERAL ====")
            print(traceback.format_exc())
            return Response({"error": str(e)}, status=500)
