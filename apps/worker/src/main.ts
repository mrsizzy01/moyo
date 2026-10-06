import { Worker, Queue, Job } from 'bullmq';
import IORedis from 'ioredis';
import * as path from 'path';
import * as fs from 'fs';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { PrismaClient } from '@prisma/client';
import * as Minio from 'minio';

const execFileAsync = promisify(execFile);
const prisma = new PrismaClient();

// ─── Redis & MinIO ────────────────────────────────────────────────────────────
const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'moyo_minio',
  secretKey: process.env.MINIO_SECRET_KEY || 'moyo_secret',
});

const BUCKET = process.env.MINIO_BUCKET || 'moyo-media';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

async function downloadFromMinio(objectKey: string, localPath: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    minioClient.fGetObject(BUCKET, objectKey, localPath, (err) => {
      if (err) reject(err); else resolve();
    });
  });
}

async function uploadFileToMinio(localPath: string, objectKey: string, contentType: string): Promise<void> {
  await minioClient.fPutObject(BUCKET, objectKey, localPath, { 'Content-Type': contentType });
}

async function uploadDirToMinio(localDir: string, prefix: string): Promise<void> {
  const files = fs.readdirSync(localDir);
  for (const file of files) {
    const fullPath = path.join(localDir, file);
    if (fs.statSync(fullPath).isFile()) {
      const ext = path.extname(file);
      const contentType = ext === '.m3u8' ? 'application/x-mpegURL' : ext === '.ts' ? 'video/MP2T' : 'application/octet-stream';
      await uploadFileToMinio(fullPath, `${prefix}/${file}`, contentType);
    }
  }
}

function cleanupDir(dirPath: string): void {
  if (fs.existsSync(dirPath)) fs.rmSync(dirPath, { recursive: true, force: true });
}

/**
 * Probe media with ffprobe and return duration in seconds.
 */
async function getMediaDuration(filePath: string): Promise<number> {
  const { stdout } = await execFileAsync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    filePath,
  ]);
  return Math.round(parseFloat(stdout.trim())) || 0;
}

/**
 * Generate a thumbnail image from a video at a given timestamp.
 */
async function generateThumbnail(inputPath: string, outputPath: string, timestamp = '00:00:05'): Promise<void> {
  await execFileAsync('ffmpeg', [
    '-y', '-ss', timestamp, '-i', inputPath,
    '-vframes', '1', '-q:v', '2', '-vf', 'scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2',
    outputPath,
  ]);
}

/**
 * Transcode video source file to multi-quality HLS.
 * Renditions: 1080p, 720p, 480p, 360p.
 */
async function transcodeVideoToHLS(inputPath: string, outputDir: string): Promise<void> {
  ensureDir(outputDir);

  const renditions = [
    { name: '1080p', width: 1920, height: 1080, vbr: '4500k', abr: '192k' },
    { name: '720p',  width: 1280, height: 720,  vbr: '2800k', abr: '128k' },
    { name: '480p',  width: 854,  height: 480,  vbr: '1400k', abr: '96k'  },
    { name: '360p',  width: 640,  height: 360,  vbr: '800k',  abr: '64k'  },
  ];

  // Build ffmpeg arguments for ABR ladder
  const args: string[] = ['-y', '-i', inputPath];

  // Map each rendition
  renditions.forEach((_, i) => { args.push('-map', '0:v:0', '-map', '0:a:0'); });

  // Encode each variant
  renditions.forEach((r, i) => {
    args.push(
      `-filter:v:${i}`, `scale=w=${r.width}:h=${r.height}:force_original_aspect_ratio=decrease`,
      `-c:v:${i}`, 'libx264', `-b:v:${i}`, r.vbr, '-preset', 'veryfast',
      `-c:a:${i}`, 'aac', `-b:a:${i}`, r.abr, '-ar', '44100',
    );
  });

  // HLS output parameters
  args.push(
    '-f', 'hls',
    '-hls_time', '6',
    '-hls_playlist_type', 'vod',
    '-hls_flags', 'independent_segments',
    '-hls_segment_type', 'mpegts',
    '-hls_segment_filename', `${outputDir}/%v/segment_%03d.ts`,
    '-master_pl_name', 'index.m3u8',
    '-var_stream_map',
    renditions.map((r, i) => `v:${i},a:${i},name:${r.name}`).join(' '),
    `${outputDir}/%v/index.m3u8`,
  );

  await execFileAsync('ffmpeg', args);
}

/**
 * Transcode audio source to HLS (AAC segments + m3u8).
 */
async function transcodeAudioToHLS(inputPath: string, outputDir: string): Promise<void> {
  ensureDir(outputDir);
  await execFileAsync('ffmpeg', [
    '-y', '-i', inputPath,
    '-c:a', 'aac', '-b:a', '128k', '-ar', '44100',
    '-f', 'hls', '-hls_time', '10', '-hls_playlist_type', 'vod',
    '-hls_segment_filename', `${outputDir}/segment_%03d.ts`,
    `${outputDir}/index.m3u8`,
  ]);
}

// ─── Job Handlers ─────────────────────────────────────────────────────────────

async function processVideoJob(job: Job) {
  const { videoId, sourceObjectKey } = job.data as { videoId: string; sourceObjectKey: string };
  const logger = (msg: string) => console.log(`[Worker][Video:${videoId}] ${msg}`);

  logger('Début du traitement');
  await job.updateProgress(5);

  const workDir = path.join('/tmp', 'moyo-worker', videoId);
  const sourceFile = path.join(workDir, 'source' + path.extname(sourceObjectKey));
  const outputDir = path.join(workDir, 'hls');
  const thumbFile = path.join(workDir, 'thumbnail.jpg');

  ensureDir(workDir);

  try {
    // 1. Update status to PROCESSING
    await prisma.video.update({ where: { id: videoId }, data: { status: 'PROCESSING' } });

    // 2. Download source from MinIO
    logger(`Téléchargement depuis MinIO : ${sourceObjectKey}`);
    await downloadFromMinio(sourceObjectKey, sourceFile);
    await job.updateProgress(15);

    // 3. Probe duration
    logger('Analyse de la durée');
    const durationSeconds = await getMediaDuration(sourceFile);
    await job.updateProgress(20);

    // 4. Generate thumbnail
    logger('Génération de la miniature');
    await generateThumbnail(sourceFile, thumbFile);
    const thumbKey = `thumbnails/${videoId}/thumbnail.jpg`;
    await uploadFileToMinio(thumbFile, thumbKey, 'image/jpeg');
    const thumbnailUrl = `/media/${thumbKey}`;
    await job.updateProgress(30);

    // 5. Transcode to HLS
    logger('Transcodage HLS en cours (multi-qualité)');
    await transcodeVideoToHLS(sourceFile, outputDir);
    await job.updateProgress(80);

    // 6. Upload HLS segments to MinIO
    logger('Upload des segments HLS vers MinIO');
    await uploadDirToMinio(outputDir, `videos/${videoId}/hls`);

    // Upload sub-dirs (renditions)
    const renditions = fs.readdirSync(outputDir).filter(f => fs.statSync(path.join(outputDir, f)).isDirectory());
    for (const r of renditions) {
      await uploadDirToMinio(path.join(outputDir, r), `videos/${videoId}/hls/${r}`);
    }

    await job.updateProgress(90);

    const masterPlaylistUrl = `/media/videos/${videoId}/hls/index.m3u8`;

    // 7. Mark video as PUBLISHED
    await prisma.video.update({
      where: { id: videoId },
      data: { status: 'PUBLISHED', masterPlaylistUrl, thumbnailUrl, durationSeconds, publishedAt: new Date() },
    });

    logger(`✅ Traitement terminé. URL HLS : ${masterPlaylistUrl}`);
    await job.updateProgress(100);

    return { success: true, videoId, masterPlaylistUrl, thumbnailUrl, durationSeconds };
  } catch (err: any) {
    logger(`❌ Erreur de traitement : ${err.message}`);
    await prisma.video.update({ where: { id: videoId }, data: { status: 'FAILED' } });
    throw err;
  } finally {
    cleanupDir(workDir);
  }
}

async function processAudioJob(job: Job) {
  const { videoId, sourceObjectKey } = job.data as { videoId: string; sourceObjectKey: string };
  const logger = (msg: string) => console.log(`[Worker][Audio:${videoId}] ${msg}`);

  logger('Début du traitement audio');
  await job.updateProgress(5);

  const workDir = path.join('/tmp', 'moyo-worker', videoId);
  const sourceFile = path.join(workDir, 'source' + path.extname(sourceObjectKey));
  const outputDir = path.join(workDir, 'hls');

  ensureDir(workDir);

  try {
    await prisma.video.update({ where: { id: videoId }, data: { status: 'PROCESSING' } });

    logger(`Téléchargement source audio : ${sourceObjectKey}`);
    await downloadFromMinio(sourceObjectKey, sourceFile);
    await job.updateProgress(20);

    const durationSeconds = await getMediaDuration(sourceFile);
    await job.updateProgress(30);

    logger('Transcodage audio HLS');
    await transcodeAudioToHLS(sourceFile, outputDir);
    await job.updateProgress(80);

    logger('Upload segments audio MinIO');
    await uploadDirToMinio(outputDir, `audio/${videoId}/hls`);
    await job.updateProgress(92);

    const masterPlaylistUrl = `/media/audio/${videoId}/hls/index.m3u8`;

    await prisma.video.update({
      where: { id: videoId },
      data: { status: 'PUBLISHED', masterPlaylistUrl, durationSeconds, publishedAt: new Date() },
    });

    logger(`✅ Audio traité. URL HLS : ${masterPlaylistUrl}`);
    await job.updateProgress(100);

    return { success: true, videoId, masterPlaylistUrl, durationSeconds };
  } catch (err: any) {
    logger(`❌ Erreur traitement audio : ${err.message}`);
    await prisma.video.update({ where: { id: videoId }, data: { status: 'FAILED' } });
    throw err;
  } finally {
    cleanupDir(workDir);
  }
}

// ─── Worker Start ─────────────────────────────────────────────────────────────
const videoWorker = new Worker(
  'media-processing',
  async (job: Job) => {
    const type = job.data?.type || 'VIDEO';
    if (type === 'AUDIO') return processAudioJob(job);
    return processVideoJob(job);
  },
  {
    connection,
    concurrency: parseInt(process.env.WORKER_CONCURRENCY || '2'),
  }
);

videoWorker.on('completed', (job, result) => {
  console.log(`✅ Job ${job.id} terminé :`, JSON.stringify(result));
});

videoWorker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} échoué :`, err.message);
});

videoWorker.on('progress', (job, progress) => {
  console.log(`⏳ Job ${job.id} — progression : ${progress}%`);
});

console.log('🚀 Moyo Worker démarré. En attente de jobs media-processing...');

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('📴 Arrêt du worker (SIGTERM)...');
  await videoWorker.close();
  await prisma.$disconnect();
  process.exit(0);
});
