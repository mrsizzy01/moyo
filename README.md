# Moyo — Regarder. Écouter. Créer. Diffuser.

Plateforme open source de diffusion et de publication multimédia : films, séries, animations, musique, podcasts, vidéos et Live streaming.

---

## 📑 Documentation

- [Cahier des charges complet](file:///c:/Users/sizzyshk/Desktop/moyo/docs/CAHIER_DES_CHARGES.md)
- [Master Prompt de développement](file:///c:/Users/sizzyshk/Desktop/moyo/docs/MASTER_PROMPT.md)

---

## 🛠 Stack Technique

- **Frontend :** Angular + TypeScript + Tailwind CSS + PWA
- **Backend :** NestJS + REST API + Socket.IO (Redis)
- **Base de données :** PostgreSQL + Prisma ORM
- **Cache & Jobs :** Redis + BullMQ
- **Moteur Média :** FFmpeg / FFprobe (HLS adaptatif multi-débits)
- **Stockage :** MinIO (local) / Compatible S3 (production)
- **Conteneurs :** Docker & Docker Compose

---

## 🏗 Structure du Monorepo

```text
moyo/
├── apps/
│   ├── web/               # Application Frontend Angular
│   ├── api/               # API Backend NestJS
│   └── worker/            # Traitement média FFmpeg & BullMQ
├── packages/
│   ├── types/             # Types et interfaces partagés TypeScript
│   ├── ui/                # Composants réutilisables
│   └── config/            # Configurations communes
├── infrastructure/
│   ├── docker/            # Dockerfiles des services
│   └── nginx/             # Configuration Nginx & Live Ingest
├── docs/                  # Cahier des charges & guides d'architecture
└── docker-compose.yml     # Orchestration des services
```

---

## ⚖️ Licence

Le logiciel Moyo est sous licence **GNU Affero General Public License v3.0 (AGPL-3.0)**.
Voir le fichier [LICENSE](file:///c:/Users/sizzyshk/Desktop/moyo/LICENSE) pour plus de détails.
*Note : Les contenus téléversés par les créateurs restent leur propriété exclusive et conservent leur licence respective.*
