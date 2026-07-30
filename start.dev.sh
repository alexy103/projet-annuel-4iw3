#!/bin/bash

set -e

docker info >/dev/null 2>&1 || { echo "❌ Docker n'est pas démarré"; exit 1; }

echo "🚀 Lancement du docker..."
cp .env.dev.example .env
mkdir -p backend/docker_data

set -a
source .env
set +a

docker compose -f dev.docker-compose.yml up -d --build

echo ""

echo "📦 Installation des dépendances du backend..."
cd backend/
cp .env.dev.example .env
npm install

echo ""

echo "⏳ Attente que PostgreSQL soit prêt..."

until [ "$(docker inspect -f '{{.State.Health.Status}}' annuel-postgres)" = "healthy" ]; do
  echo "Postgres pas encore prêt..."
  sleep 2
done

echo "✅ PostgreSQL prêt"

echo "🔄 Lancement des migrations..."
npm run migrate:up

echo ""

echo "🏗 Build de l'app..."
npm run build

echo "✅ Setup terminé"