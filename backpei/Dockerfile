FROM python:3.11-slim

WORKDIR /app

RUN pip install --upgrade pip setuptools wheel

COPY limpezaBack.sh /limpezaBack.sh
RUN chmod +x /limpezaBack.sh

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

COPY backend.sh /backend.sh
RUN chmod +x /backend.sh



EXPOSE 8000

CMD ["sh", "/backend.sh"]