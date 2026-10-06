import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import * as crypto from 'crypto';
import * as path from 'path';

export interface UploadResult {
  objectKey: string;
  url: string;
  sizeBytes: number;
  mimeType: string;
  originalName: string;
}

@Injectable()
export class UploadService implements OnModuleInit {
  private readonly logger = new Logger(UploadService.name);
  private minioClient: Minio.Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    const endPoint = this.config.get<string>('S3_ENDPOINT', 'localhost');
    const port = parseInt(this.config.get<string>('S3_PORT', '9000'), 10);
    const useSSL = this.config.get<string>('S3_USE_SSL', 'false') === 'true';
    const accessKey = this.config.get<string>('S3_ACCESS_KEY', 'minioadmin');
    const secretKey = this.config.get<string>('S3_SECRET_KEY', 'miniopassword123');
    this.bucket = this.config.get<string>('S3_BUCKET', 'moyo-media');

    this.minioClient = new Minio.Client({
      endPoint: endPoint.replace(/^https?:\/\//, ''),
      port,
      useSSL,
      accessKey,
      secretKey,
    });
  }

  async onModuleInit() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucket);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucket, 'us-east-1');
        this.logger.log(`Bucket MinIO '${this.bucket}' créé avec succès.`);
      } else {
        this.logger.log(`Bucket MinIO '${this.bucket}' prêt.`);
      }
    } catch (err) {
      this.logger.warn(`Impossible de vérifier/créer le bucket MinIO '${this.bucket}': ${err.message}`);
    }
  }

  async uploadToMinio(
    file: Express.Multer.File,
    folder: string = 'uploads',
    userId: string,
  ): Promise<UploadResult> {
    const ext = path.extname(file.originalname).toLowerCase();
    const hash = crypto.randomBytes(8).toString('hex');
    const timestamp = Date.now();
    const objectKey = `${folder}/${userId}/${timestamp}-${hash}${ext}`;

    const metaData = {
      'Content-Type': file.mimetype,
      'x-amz-meta-original-name': encodeURIComponent(file.originalname),
      'x-amz-meta-user-id': userId,
    };

    await this.minioClient.putObject(
      this.bucket,
      objectKey,
      file.buffer,
      file.size,
      metaData,
    );

    const publicUrl = this.config.get<string>(
      'S3_PUBLIC_URL',
      `http://localhost:9000/${this.bucket}`,
    );

    return {
      objectKey,
      url: `${publicUrl}/${objectKey}`,
      sizeBytes: file.size,
      mimeType: file.mimetype,
      originalName: file.originalname,
    };
  }

  async getPresignedUploadUrl(objectKey: string, expirySeconds: number = 3600): Promise<string> {
    return this.minioClient.presignedPutObject(this.bucket, objectKey, expirySeconds);
  }

  async getPresignedDownloadUrl(objectKey: string, expirySeconds: number = 86400): Promise<string> {
    return this.minioClient.presignedGetObject(this.bucket, objectKey, expirySeconds);
  }

  async deleteObject(objectKey: string): Promise<void> {
    await this.minioClient.removeObject(this.bucket, objectKey);
  }
}
