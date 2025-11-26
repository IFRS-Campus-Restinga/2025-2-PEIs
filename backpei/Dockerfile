FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

COPY backend.sh /backend.sh
RUN chmod +x /backend.sh

EXPOSE 8000

ENTRYPOINT ["/backend.sh"]
