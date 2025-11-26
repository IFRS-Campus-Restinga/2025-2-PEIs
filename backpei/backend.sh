#!/bin/sh

echo "📦 Instalando dependências do Python..."
pip install --no-cache-dir -r requirements.txt

echo "🚧 Aplicando migrations..."
python manage.py migrate

echo "👤 Criando superusuário administrador (se não existir)..."
echo "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='administrador').exists():
    User.objects.create_superuser(
        username='administrador',
        email='admin@example.com',
        password='12345678'
    )
" | python manage.py shell

echo "🗂️ Populando banco automaticamente..."
python populaBanco.py

echo "🚀 Iniciando servidor Django..."
python manage.py runserver 0.0.0.0:8000
