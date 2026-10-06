import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { QueryVideosDto } from './dto/query-videos.dto';
import { ContentStatus, VideoQuality } from '@moyo/types';

@Injectable()
export class VideosService {
  private readonly logger = new Logger(VideosService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryVideosDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      status: ContentStatus.PUBLISHED,
    };

    if (query.mediaType) {
      where.mediaType = query.mediaType;
    }

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
            select: {
              id: true,
              channelName: true,
              slug: true,
              avatarUrl: true,
              isVerified: true,
            },
          },
          variants: {
            select: {
              quality: true,
              playlistUrl: true,
            },
          },
        },
      }),
      this.prisma.video.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(idOrSlug: string) {
    const video = await this.prisma.video.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        creator: {
          select: {
            id: true,
            channelName: true,
            slug: true,
            avatarUrl: true,
            bio: true,
            isVerified: true,
            subscribersCount: true,
          },
        },
        variants: true,
      },
    });

    if (!video) {
      throw new NotFoundException('Vidéo introuvable');
    }

    // Incrémente les vues réelles
    await this.prisma.video.update({
      where: { id: video.id },
      data: { viewsCount: { increment: 1 } },
    });

    return video;
  }

  async create(userId: string, dto: CreateVideoDto) {
    // Vérification du profil créateur de l'utilisateur
    let creator = await this.prisma.creatorProfile.findUnique({
      where: { userId },
    });

    if (!creator) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new ForbiddenException('Utilisateur inexistant');

      creator = await this.prisma.creatorProfile.create({
        data: {
          userId,
          channelName: user.displayName,
          slug: `${user.username}-${Date.now().toString().slice(-4)}`,
        },
      });
    }

    const baseSlug = dto.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const slug = `${baseSlug}-${Date.now().toString().slice(-6)}`;

    const video = await this.prisma.video.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        mediaType: dto.mediaType,
        license: dto.license,
        status: ContentStatus.PROCESSING,
        originalKey: dto.originalKey,
        thumbnailUrl: dto.thumbnailUrl,
        creatorId: creator.id,
      },
      include: {
        creator: true,
      },
    });

    // Enregistrement de la tâche de transcodage média
    await this.prisma.mediaProcessingJob.create({
      data: {
        videoId: video.id,
        progress: 0,
      },
    });

    this.logger.log(`Vidéo créée : ${video.id} (statut PROCESSING). Tâche d encodage HLS initialisée.`);

    return video;
  }
}
