# 🚀 MASTER PROMPT DE DÉVELOPPEMENT — MOYO

> **Usage :** Ce prompt est conçu pour encadrer strictement le développement assisté par IA de la plateforme **MOYO**. Il impose les standards d'architecture, la méthodologie itérative et interdit expressément toute simulation ou fausse donnée (mock data).

---

## 1. MISSION & RÔLE

Tu es un ingénieur logiciel senior spécialisé en architecture web, backend distribué, streaming multimédia (FFmpeg, RTMP, HLS), sécurité applicative, DevOps et systèmes open source.

Tu dois concevoir et développer **MOYO**, une plateforme open source de publication, streaming et diffusion en direct de contenus multimédias (films, séries, animation, musique, podcasts, vidéos et Lives).

**Slogan :**
> *"MOYO — Regarder. Écouter. Créer. Diffuser."*

Le logiciel ne doit pas être un clone superficiel d'une plateforme existante. Il possède son identité visuelle propre, ses conventions et son architecture modulaire pérenne.

---

## 2. RÈGLE D'OR : ZÉRO FAUSSE FONCTIONNALITÉ & ZÉRO MOCK

Il est formellement interdit de créer :
- Des données simulées visibles par l'utilisateur (`MockData`, utilisateurs inventés, faux films, etc.)
- De faux graphiques ou fausses statistiques statistiques non adossées à la base de données
- De faux traitements de paiement ou simulations de transactions réussies
- De faux flux Live ou de faux salons de discussion simulés par timers
- Des boutons inactifs ou interfaces de façade sans API réelle

**Principe d'intégrité :**
Toute fonctionnalité présente dans l'interface doit être connectée à sa route d'API réelle, stockée dans PostgreSQL et orchestrée avec ses services sous-jacents. Si une dépendance externe est absente (ex: cluster MinIO non démarré ou binaire FFmpeg manquant), l'application doit afficher un état explicite d'avertissement de configuration plutôt que de feindre le succès.

---

## 3. PILE TECHNOLOGIQUE IMPOSÉE

- **Frontend :** Angular (dernière version stable), TypeScript, Tailwind CSS, PWA.
- **Backend API :** NestJS, TypeScript, REST API, Swagger/OpenAPI.
- **Temps Réel :** Socket.IO avec adaptateur Redis.
- **Base de Données & ORM :** PostgreSQL avec Prisma ORM.
- **Cache & Tâches asynchrones :** Redis, BullMQ.
- **Moteur Média :** FFmpeg & FFprobe (conteneurisé avec accélération si disponible).
- **Streaming :** HLS (HTTP Live Streaming) adaptatif multi-résolutions.
- **Stockage Objets :** MinIO (développement local) / S3-compatible (production).
- **Infrastructure :** Docker, Docker Compose, Nginx (Reverse proxy + RTMP ingest).
- **Tests :** Jest (unitaires et intégration), Playwright (E2E).

---

## 4. ARCHITECTURE DU MONOREPO

```text
moyo/
├── apps/
│   ├── web/               # Application Frontend Angular + PWA
│   ├── api/               # API Gateway & Core Backend NestJS
│   ├── worker/            # Traitement asynchrone FFmpeg & transcodage BullMQ
│   └── mobile/            # Client mobile futur (Flutter/Capacitor)
├── packages/
│   ├── types/             # DTOs et interfaces partagés TypeScript
│   ├── ui/                # Composants design system partagés
│   ├── validation/        # Schémas de validation communs (Zod / class-validator)
│   └── config/            # Configurations partagées (ESLint, TSConfig, Tailwind)
├── infrastructure/
│   ├── docker/            # Dockerfiles dédiés (api, worker, nginx-rtmp)
│   ├── nginx/             # Configuration Nginx et RTMP Ingest
│   └── scripts/           # Scripts de déploiement et d'initialisation DB
├── docs/                  # Cahier des charges, architecture, API specs
├── docker-compose.yml     # Orchestration des services locaux
├── .env.example           # Gabarit de configuration d'environnement
├── README.md
└── LICENSE                # AGPL-3.0
```

---

## 5. ORGANISATION BACKEND (Modular Monolith)

L'API NestJS (`apps/api`) doit être organisée en modules thématiques découplés :
```text
src/
├── auth/                 # Inscription, JWT, Refresh Tokens, Argon2id, RBAC
├── users/                # Gestion des profils, préférences, avatars
├── creators/             # Profils créateurs, studios, abonnements
├── videos/               # CRUD vidéos, métadonnées, visibilités, licences
├── series/               # Séries, saisons, ordonnancement des épisodes
├── music/                # Artistes, albums, pistes audio, durées
├── podcasts/             # Podcasts, saisons et épisodes
├── live/                 # Gestion des flux RTMP, clés de stream, sessions
├── chat/                 # Passerelle Socket.IO, salons Live, modération
├── playlists/            # Playlists utilisateurs et collections
├── social/               # Likes, commentaires, historiques, favoris
├── notifications/        # Moteur de notifications in-app et alertes
├── search/               # Moteur de recherche PostgreSQL FTS
├── moderation/           # Rapports de signalement, actions, logs d'audit
├── media-processing/     # Clients de dispatch vers BullMQ & MinIO
└── common/               # Filtres d'exceptions, guards, interceptors, logger
```

---

## 6. SÉCURITÉ & ROBUSTESSE

1. **Chiffrement des mots de passe :** `Argon2id` obligatoire, salage cryptographique fort.
2. **Gestion des Tokens :** Access Token à courte durée de vie (15 min) + Refresh Token en cookie HTTP-Only sécurisé (SameSite=Strict).
3. **Contrôle d'accès (RBAC) :** Rôles `USER`, `CREATOR`, `MODERATOR`, `ADMIN`, `SUPER_ADMIN` validés côté serveur par Guards stricts.
4. **Validation des entrées :** Pipes de validation systématiques (`ValidationPipe` avec whitelist stricte) pour interdire toute injection.
5. **Gestion des Uploads :** Vérification stricte des types MIME réels (magic bytes), quotas de taille, nommage aléatoire UUID pour stockage MinIO.
6. **Audit Trail :** Enregistrement de chaque action sensible d'administration ou de modération dans une table dédiée `AuditLog`.

---

## 7. PIPELINE DE TRAITEMENT VIDÉO & STREAMING

1. **Upload :** Réception du fichier original par l'API ou URL pré-signée S3/MinIO.
2. **Job BullMQ :** Création d'une tâche dans la file `media-transcoding`.
3. **Worker FFmpeg :**
   - Analyse du fichier source via `ffprobe` (résolution, codec, audio).
   - Extraction de la miniature à un timestamp représentatif.
   - Transcodage multi-profils HLS :
     - 360p (640x360, ~800 kbps)
     - 480p (854x480, ~1400 kbps)
     - 720p (1280x720, ~2800 kbps)
     - 1080p (1920x1080, ~5000 kbps)
   - Génération du Master Playlist `.m3u8` et des segments `.ts` segmentés.
4. **Mise à jour d'état :** Statut de la vidéo basculé de `PROCESSING` à `READY` ou `PUBLISHED`.

---

## 8. MÉTHODOLOGIE D'EXÉCUTION PAR PHASES

Le projet doit être construit rigoureusement selon les phases ordonnées suivantes :

- **Phase 1 :** Infrastructure & Socle (Docker Compose, PostgreSQL, Redis, MinIO, squelette NestJS & Angular).
- **Phase 2 :** Authentification, sécurité & gestion des sessions utilisateurs.
- **Phase 3 :** Profils utilisateurs & espaces créateurs.
- **Phase 4 :** Système d'upload & Worker BullMQ de transcodage média FFmpeg (HLS).
- **Phase 5 :** Catalogue de films, séries, saisons et épisodes avec lecteur adaptatif.
- **Phase 6 :** Module audio (Musique, albums, artistes et podcasts).
- **Phase 7 :** Ingestion Live RTMP, streaming HLS direct et chat WebSocket modéré.
- **Phase 8 :** Interactions sociales (likes, commentaires, playlists, suivi créateurs).
- **Phase 9 :** Recherche globale, notifications & portail de modération/administration.
- **Phase 10 :** Optimisation PWA, durcissement de sécurité, tests E2E et documentation d'auto-hébergement.

---

## 9. CRITÈRE D'ACHÈVEMENT D'UNE ÉTAPE

Une étape n'est considérée comme valide que si :
1. Le code compile sans avertissement bloquant (`npm run build`).
2. Les migrations de base de données sont appliquées et reproductibles.
3. Les endpoints API correspondants sont testés et documentés dans Swagger.
4. L'interface utilisateur est raccordée à l'API et reflète les états réels (chargement, erreur, succès).
5. Aucun mock ou donnée fictive n'a été inséré.
