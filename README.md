# 🎬 Moyo

> **Regarder. Écouter. Créer. Diffuser.**

Plateforme open source de diffusion et de publication multimédia — films, séries, musique, podcasts, vidéos & live streaming.

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.x-red)](https://nestjs.com/)
[![Angular](https://img.shields.io/badge/Angular-17+-red)](https://angular.dev/)

---

## 🏗️ Architecture

```
moyo/
├── apps/
│   ├── api/          # NestJS REST API + WebSocket
│   │   ├── prisma/   # Schéma PostgreSQL (Prisma)
│   │   └── src/
│   │       ├── auth/         # JWT + Argon2id
│   │       ├── videos/       # CRUD + upload + BullMQ
│   │       ├── series/       # Séries, saisons, épisodes
│   │       ├── music/        # Artistes, albums, pistes
│   │       ├── podcasts/     # Podcasts & épisodes
│   │       ├── live/         # RTMP/HLS + chat WebSocket
│   │       ├── search/       # Recherche globale
│   │       ├── social/       # Likes, commentaires, suivis
│   │       └── moderation/   # Signalements & audit
│   ├── web/          # Angular 17+ PWA
│   │   └── src/app/
│   │       ├── components/  # VideoPlayer (HLS.js), AudioPlayer
│   │       └── pages/       # Home, Watch, Séries, Musique, Podcasts, Live, Studio...
│   └── worker/       # BullMQ Worker FFmpeg (transcodage HLS multi-qualité)
├── packages/
│   └── types/        # Types & Enums partagés (@moyo/types)
├── docker-compose.yml   # PostgreSQL, Redis, MinIO, Nginx RTMP
└── .env.example
```

---

## 🛠️ Stack Technique

| Couche | Technologie |
|--------|-------------|
| **API** | NestJS 10, TypeScript, Swagger |
| **BDD** | PostgreSQL 16 + Prisma ORM |
| **Auth** | JWT (Access/Refresh) + Argon2id |
| **Queue** | BullMQ + Redis |
| **Transcodage** | FFmpeg (HLS multi-qualité : 1080p/720p/480p/360p) |
| **Stockage** | MinIO (compatible S3) |
| **WebSocket** | Socket.IO (chat live temps réel) |
| **Live** | Nginx RTMP → HLS |
| **Frontend** | Angular 17+ Standalone + Tailwind CSS |
| **Lecteur** | HLS.js (vidéo adaptive) |

---

## 🚀 Démarrage rapide

### Prérequis

- **Node.js** ≥ 20
- **Docker** + **Docker Compose**
- **FFmpeg** installé localement (pour le worker)

### 1. Cloner et configurer

```bash
git clone https://github.com/mrsizzy01/moyo.git
cd moyo
cp .env.example .env
# Modifier les variables dans .env si nécessaire
```

### 2. Démarrer l'infrastructure

```bash
docker compose up -d
# PostgreSQL :5432 | Redis :6379 | MinIO :9000/:9001 | RTMP :1935
```

### 3. Installer les dépendances

```bash
npm install
```

### 4. Migrer la base de données

```bash
cd apps/api
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Démarrer les services

```bash
# Terminal 1 — API NestJS
cd apps/api && npm run start:dev

# Terminal 2 — Worker FFmpeg
cd apps/worker && npm run start:dev

# Terminal 3 — Web Angular
cd apps/web && npm start
```

### Accès

| Service | URL |
|---------|-----|
| Web (Angular) | http://localhost:4200 |
| API (REST) | http://localhost:3000/api |
| Swagger | http://localhost:3000/docs |
| MinIO Console | http://localhost:9001 |
| API Health | http://localhost:3000/api/health |

---

## 📡 API Endpoints

| Module | Méthode | Route |
|--------|---------|-------|
| **Auth** | POST | `/api/auth/register` |
| **Auth** | POST | `/api/auth/login` |
| **Vidéos** | GET | `/api/videos` |
| **Vidéos** | POST | `/api/videos` |
| **Vidéos** | GET | `/api/videos/:id` |
| **Séries** | GET | `/api/series` |
| **Séries** | GET | `/api/series/:id` |
| **Musique** | GET | `/api/music/artists` |
| **Musique** | GET | `/api/music/tracks` |
| **Podcasts** | GET | `/api/podcasts` |
| **Live** | GET | `/api/live` |
| **Live** | POST | `/api/live` |
| **Recherche** | GET | `/api/search?q=` |
| **Social** | POST | `/api/social/likes/:videoId` |
| **Social** | GET | `/api/social/comments/:videoId` |
| **Social** | POST | `/api/social/follow/:creatorId` |
| **Modération** | POST | `/api/moderation/reports` |

---

## 🎥 Flux de transcodage

```
Upload → MinIO (source) → BullMQ Job → Worker FFmpeg
  → Probe (durée) → Thumbnail (JPEG) → HLS ABR
  → 1080p / 720p / 480p / 360p (segments .ts)
  → Upload HLS → MinIO → Prisma (PUBLISHED)
  → Lecteur HLS.js (streaming adaptatif)
```

---

## 📺 Live Streaming

```
OBS/Streamlabs → RTMP (port 1935) → Nginx RTMP
  → HLS segments → MinIO
  → Lecteur HLS.js + Chat WebSocket (Socket.IO)
```

**Clé de stream** : générée automatiquement à la création d'un live via `/api/live`.

---

## 🔒 Sécurité

- Mots de passe hachés avec **Argon2id**
- **JWT** avec Access Token (7j) et Refresh Token (30j)
- Toutes les routes sensibles protégées par `JwtAuthGuard`
- Signalements de contenu avec audit trail
- Pas de données simulées (zero mock data)

---

## 📄 Licence

[AGPL-3.0](./LICENSE) — Toute utilisation commerciale du code doit reverser les modifications à la communauté.

---

*Moyo — Regarder. Écouter. Créer. Diffuser.*
