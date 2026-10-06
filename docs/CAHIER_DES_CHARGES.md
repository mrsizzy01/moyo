# 📘 CAHIER DES CHARGES COMPLET — MOYO

## 1. Identification du projet

- **Nom :** Moyo
- **Type :** Plateforme open source de diffusion et de publication multimédia
- **Nature :** Web + PWA, puis applications mobiles et clients dédiés
- **Licence logicielle :** AGPL-3.0 (à confirmer juridiquement avant publication)
- **Modèle :** Open Source + auto-hébergement + services cloud managés optionnels

### Slogan
> **Moyo — Regarder. Écouter. Créer. Diffuser.**

---

## 2. Présentation générale

Moyo est une plateforme open source permettant aux utilisateurs de **regarder, écouter, publier et diffuser en direct** différents types de contenus numériques :
* Films indépendants et de studios
* Séries, saisons et épisodes
* Dessins animés et animations (2D, 3D, anime indé)
* Vidéos courtes et longues
* Musique (morceaux, albums, profils artistes)
* Podcasts audio et vidéo
* Diffusions en direct (Live streaming RTMP/HLS)

Moyo est conçue pour permettre à des créateurs indépendants, artistes, studios, médias, organisations et établissements scolaires de disposer d'un espace de diffusion souverain sans dépendre des plateformes propriétaires centralisées.

---

## 3. Problématique & Proposition de valeur

Les plateformes grand public actuelles imposent :
* Des algorithmes opaques et des règles de monétisation arbitraires
* Une dépendance totale à une infrastructure fermée
* Des commissions élevées et des coûts de diffusion non maîtrisés
* Des risques de censure ou de suspension unilatérale

**La réponse Moyo :**
Un logiciel libre, auto-hébergeable, auditable et communautaire, offrant des performances de streaming professionnelles tout en garantissant la propriété des données et des contenus.

---

## 4. Rôles et Acteurs du système

1. **Visiteur** : Consultation des contenus publics, recherche globale, lecture vidéo/audio, profils créateurs.
2. **Utilisateur connecté** : Gestion du profil, historique, likes, commentaires, abonnements, playlists, chat Live.
3. **Créateur** : Studio de publication, gestion de chaînes/séries/albums/podcasts, Lives RTMP, programmation, statistiques analytiques réelles.
4. **Modérateur** : Traitement de la file de signalements, masquage/suppression de contenus, modération du chat en direct, sanctions temporaires.
5. **Administrateur / Super Admin** : Supervision globale, gestion des utilisateurs, quotas de stockage, configuration de la plateforme, logs d'audit.

---

## 5. Fonctionnalités détaillées par domaine

### 5.1 Authentification & Comptes
* Inscription, connexion par identifiants / e-mail vérifié
* Sessions sécurisées avec Refresh Tokens (stockage sécurisé HTTP-only)
* Hash des mots de passe avec **Argon2id**
* Récupération de mot de passe & double facteur optionnel
* Contrôle d'accès basé sur les rôles (RBAC)

### 5.2 Catalogue Multimédia
* **Films & Vidéos** : Métadonnées complètes, visibilité (Public, Non répertorié, Privé), déclaration de droits, licence de contenu explicite.
* **Séries & Saisons** : Structure hiérarchique Série > Saisons > Épisodes ordonnés.
* **Animations** : Espace dédié aux courts-métrages, animations 2D/3D et séries animées.
* **Musique** : Entités Artiste > Albums > Pistes, player audio persistant avec file de lecture.
* **Podcasts** : Épisodes audio/vidéo chapitrés, flux RSS optionnel.

### 5.3 Moteur de Diffusion Live
* Ingestion RTMP via serveur média dédié
* Transcodage direct FFmpeg en segments HLS
* Chat temps réel via WebSockets (Socket.IO + adaptateur Redis)
* Enregistrement optionnel du Live et conversion post-session en vidéo catalogue (Replay)

### 5.4 Traitement Média & Stockage
* Téléversement sécurisé vers stockage objet (MinIO en local / S3 en production)
* File de traitement asynchrone orchestrée par **BullMQ** et **Redis**
* Sondage de flux par **FFprobe**, extraction de métadonnées et vignettes
* Transcodage adaptatif **FFmpeg** vers variantes multi-résolutions (360p, 480p, 720p, 1080p) et génération des manifests `.m3u8`

### 5.5 Social, Recherche & Modération
* Recherche textuelle PostgreSQL Full Text Search (évolutive OpenSearch)
* Interactions sociales : favoris, listes de lecture, abonnements, commentaires avec fils de discussion
* Notifications persistantes (nouveau contenu, Lives, rappels, réponses)
* File de modération avec traçabilité intégrale (`AuditLog`)

---

## 6. Architecture Technique & Choix Technologiques

| Composant | Technologie retenue | Justification |
| :--- | :--- | :--- |
| **Frontend** | Angular + TypeScript + Tailwind CSS | Architecture robuste, typage fort, performances PWA |
| **Backend** | NestJS + TypeScript | Architecture modulaire d'entreprise, injection de dépendances |
| **Temps réel** | Socket.IO + Redis Adapter | Scalabilité horizontale des WebSockets |
| **Base de données** | PostgreSQL + Prisma ORM | Intégrité relationnelle stricte, migrations reproductibles |
| **Cache & Files** | Redis + BullMQ | Gestion fiable des tâches lourdes de transcodage |
| **Média / Stream** | FFmpeg, FFprobe, HLS.js | Standard industriel du streaming adaptatif |
| **Stockage** | MinIO (Dev) / Compatible S3 (Prod) | Découplage complet des fichiers multimédias et de la BDD |
| **Conteneurs** | Docker & Docker Compose | Déploiement reproductible et auto-hébergement simplifié |

---

## 7. Structure de la Base de Données (Entités majeures)

* `User`, `CreatorProfile`, `Studio`, `StudioMember`
* `Video`, `VideoFile`, `VideoVariant`
* `Series`, `Season`, `Episode`
* `Artist`, `Album`, `Track`
* `Podcast`, `PodcastEpisode`
* `LiveStream`, `LiveSession`, `LiveMessage`, `LiveModerator`, `LiveViewer`, `LiveReminder`
* `Playlist`, `PlaylistItem`, `WatchHistory`, `Like`, `Comment`, `Follow`
* `Notification`, `Report`, `ModerationAction`, `AuditLog`
* `MediaProcessingJob`, `Subscription`, `Transaction`, `CreatorEarning`

---

## 8. Démarche de Déploiement & Auto-hébergement

Le déploiement standard pour une instance auto-hébergée repose sur un `docker-compose.yml` multi-services :
```text
moyo-compose/
 ├── postgres (Port 5432)
 ├── redis (Port 6379)
 ├── minio (Port 9000 & 9001)
 ├── moyo-api (NestJS - Port 3000)
 ├── moyo-worker (BullMQ / FFmpeg)
 ├── moyo-web (Angular - Port 80/443)
 └── nginx (Reverse Proxy, SSL, Ingest Live)
```

---

## 9. Feuille de Route (Roadmap)

* **V0.1 - Socle & Vidéo de base** : Authentification, profils, upload vidéo, transcodage FFmpeg, lecteur HLS, films, recherche de base.
* **V0.2 - Séries & Social** : Séries, saisons, épisodes, animation, playlists, likes, commentaires.
* **V0.3 - Audio & Podcasts** : Musique, albums, artistes, lecteur audio global, podcasts.
* **V0.4 - Live Streaming** : Serveur Ingest RTMP, conversion HLS direct, chat WebSocket, modération Live, replay automatique.
* **V0.5 - Administration & Analytics** : Dashboard de métriques réelles, modération avancée, notifications système.
* **V1.0 - Écosystème & Production** : PWA optimisée, documentation d'auto-hébergement complète, API publique documentée Swagger.
