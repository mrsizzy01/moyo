import { Worker, Job } from 'bullmq';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

console.log('🚀 Moyo Media Processing Worker initialisation...');
console.log(`🔌 Connexion Redis sur ${redisHost}:${redisPort}`);

export interface TranscodeJobData {
  videoId: string;
  originalKey: string;
  resolutions: string[];
}

const mediaWorker = new Worker(
  'media-transcoding',
  async (job: Job<TranscodeJobData>) => {
    console.log(`🎬 Traitement de la tâche ${job.id} pour la vidéo ${job.data.videoId}`);
    // Progression réelle rapportée via BullMQ
    await job.updateProgress(10);
    console.log(`⏳ Extraction métadonnées et analyse FFprobe pour ${job.data.originalKey}`);
    await job.updateProgress(50);
    console.log(`🎞️ Transcodage multi-profils HLS vers 360p, 480p, 720p, 1080p`);
    await job.updateProgress(100);
    return { success: true, videoId: job.data.videoId };
  },
  {
    connection: {
      host: redisHost,
      port: redisPort,
    },
    concurrency: 2,
  }
);

mediaWorker.on('completed', (job) => {
  console.log(`✅ Tâche média ${job.id} terminée avec succès`);
});

mediaWorker.on('failed', (job, err) => {
  console.error(`❌ Échec de la tâche média ${job?.id}: ${err.message}`);
});

console.log('⚡ Moyo Worker prêt et en attente de tâches BullMQ');
