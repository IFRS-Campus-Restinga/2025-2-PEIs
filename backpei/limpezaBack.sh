#!/bin/sh

APAGAR="
/app/db.sqlite3
/app/backpei/__pycache__
/app/logs/__pycache__
/app/logs/migrations/__pycache__
/app/logs/migrations/0001_initial.py
/app/pei/__pycache__
/app/pei/enums/__pycache__
/app/pei/migrations/__pycache__
/app/pei/migrations/0001_initial.py
/app/pei/migrations/0002_alter_aluno_email_alter_aluno_matricula_and_more.py
/app/pei/migrations/0003_remove_disciplina_professores_and_more.py
/app/pei/models/__pycache__
/app/pei/services/__pycache__
/app/pei/services/migrations/__pycache__
/app/pei/services/serializers/__pycache__
/app/pei/services/views/__pycache__
"

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
