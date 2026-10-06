# ==============================================================================
# Moyo — Script d'installation & démarrage automatique (PowerShell)
# Licence : AGPL-3.0 | https://github.com/mrsizzy01/moyo
# ==============================================================================

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   🚀 Démarrage de la plateforme multimédia Moyo" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Vérification Docker
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "❌ Docker n'est pas installé ou n'est pas dans le PATH."
    exit 1
}

# 2. Copie du fichier .env
if (-not (Test-Path ".env")) {
    Write-Host "📄 Création du fichier .env à partir de .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Fichier .env créé avec succès." -ForegroundColor Green
}

# 3. Lancement des conteneurs
Write-Host "📦 Démarrage des conteneurs Docker..." -ForegroundColor Yellow
docker compose up -d

# 4. Attente PostgreSQL
Write-Host "⏳ Attente de la disponibilité de PostgreSQL..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 5. Migrations et Seed
Write-Host "🔄 Application des migrations Prisma..." -ForegroundColor Yellow
docker compose exec -T api npx prisma migrate deploy

Write-Host "🌱 Peuplement de la base de données..." -ForegroundColor Yellow
docker compose exec -T api npm run prisma:seed

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "   ✨ Moyo est prêt et opérationnel !" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "🌐 Interface Web PWA      : http://localhost:80"
Write-Host "🔌 API NestJS & Swagger   : http://localhost:3000/api/docs"
Write-Host "📦 Console Stockage MinIO : http://localhost:9001"
Write-Host "🔴 Ingestion Directe RTMP : rtmp://localhost:1935/live/<streamKey>"
Write-Host "📊 Statut & Monitoring    : http://localhost:80/status"
Write-Host ""
Write-Host "Identifiants par défaut :"
Write-Host "  - Super Admin : admin@moyo.tv / MoyoAdmin2026!"
Write-Host "  - Modérateur  : moderator@moyo.tv / MoyoAdmin2026!"
Write-Host "  - Studios     : studios@moyo.tv / MoyoAdmin2026!"
Write-Host "=========================================================="
