#!/usr/bin/env bash
# ==============================================================================
# Moyo — Script d'installation & démarrage automatique
# Licence : AGPL-3.0 | https://github.com/mrsizzy01/moyo
# ==============================================================================

set -e

echo "=========================================================="
echo "   🚀 Démarrage de la plateforme multimédia Moyo"
echo "=========================================================="

# 1. Vérification des prérequis
command -v docker >/dev/null 2>&1 || { echo "❌ Docker n'est pas installé. Veuillez l'installer avant de continuer."; exit 1; }
command -v docker compose >/dev/null 2>&1 || { echo "❌ Docker Compose n'est pas disponible."; exit 1; }

# 2. Copie du fichier d'environnement si absent
if [ ! -f .env ]; then
  echo "📄 Création du fichier .env à partir de .env.example..."
  cp .env.example .env
  echo "✅ Fichier .env créé avec succès."
fi

# 3. Lancement des conteneurs d'infrastructure
echo "📦 Démarrage des services Docker (PostgreSQL, Redis, MinIO, Nginx RTMP, API, Worker, Web)..."
docker compose up -d

# 4. Attente de la disponibilité de PostgreSQL
echo "⏳ Attente de la disponibilité de la base de données PostgreSQL..."
until docker compose exec -T postgres pg_isready -U moyo_user -d moyo_db >/dev/null 2>&1; do
  sleep 2
done
echo "✅ PostgreSQL est prêt !"

# 5. Déploiement des migrations Prisma et données initiales
echo "🔄 Application des migrations de schéma Prisma..."
docker compose exec -T api npx prisma migrate deploy || true

echo "🌱 Peuplement des données initiales (Admin, Modérateur, Studios, Démo)..."
docker compose exec -T api npm run prisma:seed || true

echo ""
echo "=========================================================="
echo "   ✨ Moyo est prêt et opérationnel !"
echo "=========================================================="
echo "🌐 Interface Web PWA      : http://localhost:80"
echo "🔌 API NestJS & Swagger   : http://localhost:3000/api/docs"
echo "📦 Console Stockage MinIO : http://localhost:9001 (minioadmin / minioadmin)"
echo "🔴 Ingestion Directe RTMP : rtmp://localhost:1935/live/<streamKey>"
echo "📊 Statut & Monitoring    : http://localhost:80/status"
echo ""
echo "Identifiants par défaut :"
echo "  - Super Admin : admin@moyo.tv / MoyoAdmin2026!"
echo "  - Modérateur  : moderator@moyo.tv / MoyoAdmin2026!"
echo "  - Studios     : studios@moyo.tv / MoyoAdmin2026!"
echo "=========================================================="
