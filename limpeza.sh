
APAGAR="frontpei/node_modules
backpei/db.sqlite3
backpei/backpei/__pycache__
backpei/pei/migrations/__pycache__
backpei/pei/migrations/0001_initial.py
backpei/pei/models/__pycache__
backpei/services/__pycache__
backpei/services/migrations/__pycache__
backpei/services/serializers/__pycache__
backpei/services/views/__pycache__"

for item in $APAGAR; do
  if [ -e "$item" ]; then
    rm -rf "$item"
    if [ $? -eq 0 ]; then
      echo "--> OK Apagado: $item"
    fi
  else
    echo "--> ERRO Nao encontrado: $item"
  fi
done