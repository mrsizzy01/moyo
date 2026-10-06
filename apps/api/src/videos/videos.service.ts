import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CreateVideoDto } from './dto/create-video.dto';
import { QueryVideosDto } from './dto/query-videos.dto';

@Injectable()
export class VideosService {
  private readonly logger = new Logger(VideosService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('media-processing') private readonly mediaQueue: Queue,
  ) {}

  async findAll(query: QueryVideosDto) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = { status: 'PUBLISHED' };
    if (query.mediaType) where.mediaType = query.mediaType;
    if (query.query) {
      where.OR = [
        { title: { contains: query.query, mode: 'insensitive' } },
        { description: { contains: query.query, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.video.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        include: {
          creator: {
            select: { id: true, channelName: true, slug: true, avatarUrl: true, isVerified: true },
          },
        },
      }),
      this.prisma.video.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(idOrSlug: string) {
    const video = await this.prisma.video.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      include: {
        creator: {
          select: { id: true, channelName: true, slug: true, avatarUrl: true, bio: true, isVerified: true, subscribersCount: true },
        },
      },
    });

    if (!video) throw new NotFoundException('Vidéo introuvable');

    // Incrémentation des vues en asynchrone (non bloquant)
    this.prisma.video.update({
      where: { id: video.id },
      data: { viewsCount: { increment: 1 } },
    }).catch(() => {});

    return video;
  }

  async create(userId: string, dto: CreateVideoDto) {
    let creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });

    if (!creator) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new ForbiddenException('Utilisateur inexistant');
      creator = await this.prisma.creatorProfile.create({
        data: {
          userId,
          channelName: user.displayName || user.username,
          slug: `${user.username}-${Date.now().toString().slice(-4)}`,
        },
      });
      this.logger.log(`Profil créateur auto-créé pour l'utilisateur ${userId}`);
    }

    const baseSlug = dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const slug = `${baseSlug}-${Date.now().toString().slice(-6)}`;

    const video = await this.prisma.video.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        mediaType: (dto.mediaType as any) || 'VIDEO',
        tags: dto.tags || [],
        status: 'UPLOADING',
        sourceObjectKey: dto.sourceObjectKey,
        thumbnailUrl: dto.thumbnailUrl,
        uploaderId: userId,
        creatorId: creator.id,
      },
      include: { creator: { select: { channelName: true, slug: true } } },
    });

    // Enqueue le job de transcodage BullMQ
    if (dto.sourceObjectKey) {
      const isAudio = ['AUDIO', 'PODCAST_EPISODE'].includes(dto.mediaType || '');
      await this.mediaQueue.add(
        'transcode',
        { videoId: video.id, sourceObjectKey: dto.sourceObjectKey, type: isAudio ? 'AUDIO' : 'VIDEO' },
        { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
      );
      this.logger.log(`Job BullMQ enqueued pour vidéo ${video.id} [${isAudio ? 'AUDIO' : 'VIDEO'}]`);
    }

    return video;
  }

  async update(id: string, userId: string, data: Partial<{ title: string; description: string; tags: string[]; status: string }>) {
    const video = await this.prisma.video.findUnique({ where: { id }, include: { creator: true } });
    if (!video) throw new NotFoundException('Vidéo introuvable');
    if (video.uploaderId !== userId) throw new ForbiddenException('Accès non autorisé');
    return this.prisma.video.update({ where: { id }, data: data as any });
  }

  async remove(id: string, userId: string) {
    const video = await this.prisma.video.findUnique({ where: { id } });
    if (!video) throw new NotFoundException('Vidéo introuvable');
    if (video.uploaderId !== userId) throw new ForbiddenException('Accès non autorisé');
    return this.prisma.video.update({ where: { id }, data: { status: 'DELETED' } });
  }

  async getMyVideos(userId: string) {
    const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (!creator) return [];
    return this.prisma.video.findMany({
      where: { creatorId: creator.id, status: { not: 'DELETED' } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
