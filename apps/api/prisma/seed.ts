import { PrismaClient, Role, MediaType, VideoStatus, LiveStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du peuplement de la base de données Moyo...');

  const passwordHash = await argon2.hash('MoyoAdmin2026!');

  // 1. Administrateur principal
  const admin = await prisma.user.upsert({
    where: { email: 'admin@moyo.tv' },
    update: {},
    create: {
      email: 'admin@moyo.tv',
      username: 'moyo_admin',
      displayName: 'Administrateur Moyo',
      passwordHash,
      role: Role.ADMIN,
      isEmailVerified: true,
      isActive: true,
    },
  });
  console.log(`✅ Admin créé : ${admin.email}`);

  // 2. Modérateur
  const moderator = await prisma.user.upsert({
    where: { email: 'moderator@moyo.tv' },
    update: {},
    create: {
      email: 'moderator@moyo.tv',
      username: 'moyo_moderator',
      displayName: 'Équipe de Modération',
      passwordHash,
      role: Role.MODERATOR,
      isEmailVerified: true,
      isActive: true,
    },
  });
  console.log(`✅ Modérateur créé : ${moderator.email}`);

  // 3. Créateur Officiel (Moyo Studios)
  const creatorUser = await prisma.user.upsert({
    where: { email: 'studios@moyo.tv' },
    update: {},
    create: {
      email: 'studios@moyo.tv',
      username: 'moyo_studios',
      displayName: 'Moyo Studios',
      passwordHash,
      role: Role.CREATOR,
      isEmailVerified: true,
      isActive: true,
      creatorProfile: {
        create: {
          channelName: 'Moyo Studios',
          slug: 'moyo-studios',
          bio: 'Productions cinématographiques indépendantes, documentaires culturels et animations 2D/3D originales propulsées par la communauté Moyo.',
          isVerified: true,
          subscribersCount: 1420,
        },
      },
    },
    include: {
      creatorProfile: true,
    },
  });
  console.log(`✅ Chaîne créateur créée : ${creatorUser.creatorProfile?.channelName}`);

  const creatorProfileId = creatorUser.creatorProfile!.id;

  // 4. Vidéo / Film de démonstration
  const video1 = await prisma.video.upsert({
    where: { slug: 'lumieres-sur-le-sahel' },
    update: {},
    create: {
      title: 'Lumières sur le Sahel',
      slug: 'lumieres-sur-le-sahel',
      description: 'Un voyage visuel et sonore captivant à travers les paysages désertiques et les mélodies ancestrales du Sahel.',
      mediaType: MediaType.DOCUMENTARY,
      status: VideoStatus.PUBLISHED,
      masterPlaylistUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      durationSeconds: 630,
      resolution: '1920x1080',
      viewsCount: 1540,
      likesCount: 230,
      tags: ['sahel', 'documentaire', 'musique', 'afrique'],
      uploaderId: creatorUser.id,
      creatorId: creatorProfileId,
      publishedAt: new Date(),
    },
  });
  console.log(`✅ Film documentaire créé : ${video1.title}`);

  // 5. Série avec saisons et épisodes
  const series1 = await prisma.series.upsert({
    where: { slug: 'chroniques-du-futur' },
    update: {},
    create: {
      title: 'Chroniques du Futur',
      slug: 'chroniques-du-futur',
      description: 'Anthologie d anticipation explorant l impact des technologies décentralisées sur nos sociétés.',
      status: VideoStatus.PUBLISHED,
      creatorId: creatorProfileId,
      seasons: {
        create: [
          {
            seasonNumber: 1,
            title: 'Saison 1 — L Éveil Numérique',
            description: 'Première saison explorant la résistance des créateurs.',
          },
        ],
      },
    },
  });
  console.log(`✅ Série créée : ${series1.title}`);

  // 6. Artiste et Album de musique
  const artist = await prisma.artist.upsert({
    where: { slug: 'kora-fusion-collective' },
    update: {},
    create: {
      name: 'Kora Fusion Collective',
      slug: 'kora-fusion-collective',
      bio: 'Ensemble acoustique mariant les rythmes ouest-africains à l électro ambiante.',
      country: 'Sénégal',
      albums: {
        create: [
          {
            title: 'Échos du Mandé',
            slug: 'echos-du-mande',
            year: 2026,
            genre: 'World Fusion',
            tracks: {
              create: [
                {
                  title: 'Le Fleuve Invisible',
                  trackNumber: 1,
                  audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                  durationSeconds: 372,
                  playsCount: 840,
                },
                {
                  title: 'Harmonie des Dunes',
                  trackNumber: 2,
                  audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
                  durationSeconds: 420,
                  playsCount: 620,
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log(`✅ Artiste et album créés : ${artist.name}`);

  // 7. Podcast
  const podcast = await prisma.podcast.upsert({
    where: { slug: 'ondes-libres' },
    update: {},
    create: {
      title: 'Ondes Libres — Le Podcast de la Création Ouverte',
      slug: 'ondes-libres',
      description: 'Entretiens bimensuels avec des réalisateurs, développeurs, musiciens et penseurs du logiciel libre et de la culture ouverte.',
      creatorId: creatorProfileId,
      episodes: {
        create: [
          {
            title: 'Épisode 1 : Pourquoi diffuser sans algorithme ?',
            episodeNumber: 1,
            description: 'Discussion sur la souveraineté numérique et le modèle Moyo.',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
            durationSeconds: 1840,
            publishedAt: new Date(),
          },
        ],
      },
    },
  });
  console.log(`✅ Podcast créé : ${podcast.title}`);

  // 8. Stream Live Programmé
  const live = await prisma.liveStream.upsert({
    where: { streamKey: 'live_moyo_studios_master_key_2026' },
    update: {},
    create: {
      title: 'Grande Première — Festival du Film Indépendant Moyo',
      description: 'Diffusion en direct du gala d ouverture avec session de questions-réponses dans le chat interactif.',
      streamKey: 'live_moyo_studios_master_key_2026',
      status: LiveStatus.SCHEDULED,
      isChatEnabled: true,
      creatorId: creatorProfileId,
      scheduledFor: new Date(Date.now() + 86400000 * 2), // Dans 2 jours
    },
  });
  console.log(`✅ Diffusion Live programmée : ${live.title}`);

  console.log('✨ Base de données initialisée avec succès !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
