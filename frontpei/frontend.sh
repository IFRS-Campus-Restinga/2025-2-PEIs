#!/bin/sh

echo "📦 Instalando dependências do Node..."
npm install

echo "Iniciando Vite server..."
npm run dev -- --host
