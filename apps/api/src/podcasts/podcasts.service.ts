import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PodcastsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.podcast.findMany({
      include: {
        creator: { select: { id: true, channelName: true, slug: true, avatarUrl: true } },
        episodes: { select: { id: true, episodeNumber: true, title: true, durationSeconds: true }, orderBy: { episodeNumber: 'desc' }, take: 3 },
        _count: { select: { episodes: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const podcast = await this.prisma.podcast.findUnique({
      where: { id },
      include: {
        creator: true,
        episodes: { orderBy: { episodeNumber: 'asc' } },
      },
    });
    if (!podcast) throw new NotFoundException('Podcast introuvable');
    return podcast;
  }
}
