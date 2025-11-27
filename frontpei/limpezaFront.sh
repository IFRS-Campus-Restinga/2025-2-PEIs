#!/bin/sh

APAGAR="/app/node_modules"

for item in $APAGAR; do
  if [ -e "$item" ]; then
    rm -rf "$item"
    echo "--> OK Apagado: $item"
  else
    echo "--> Nao encontrado: $item"
  fi
done
