#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

ENV_FILE=.env.prod.local
COMPOSE="docker compose --env-file $ENV_FILE -f prod.docker-compose.yml -p annuel-prod"

if [ ! -f "$ENV_FILE" ]; then
    echo "Erreur : $ENV_FILE introuvable. Copie .env.prod.example vers $ENV_FILE et remplis-le."
    exit 1
fi

set -a
source "$ENV_FILE"
set +a

echo ">> Récupération du code"
git pull --ff-only

echo ">> Build des images de production"
$COMPOSE build

echo ">> Démarrage des conteneurs"
$COMPOSE up -d

echo ">> Attente de la base de données"
until $COMPOSE exec -T db pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1; do
    sleep 1
done

echo ">> Migrations de base de données"
$COMPOSE exec -T backend npm run migrate:up

echo ">> Déploiement terminé."
