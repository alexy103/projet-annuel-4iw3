#!/bin/bash
echo "Lancement du docker..."
cp .env.dev.example .env
mkdir backend/docker_data
docker compose -f dev.docker-compose.yml up -d --build

echo ""

echo "Installation des dépendances du backend..."
cd backend/
cp .env.dev.example .env
npm install

echo ""

sleep 20

echo "Lancement des migrations..."
npm run migrate:up

echo ""

echo "Build de l'app"
npm run build

echo ""