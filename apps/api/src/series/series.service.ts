import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SeriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.series.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        creator: { select: { id: true, channelName: true, slug: true, avatarUrl: true } },
        seasons: {
          include: {
            episodes: { select: { id: true, episodeNumber: true, title: true } },
          },
          orderBy: { seasonNumber: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(idOrSlug: string) {
    const series = await this.prisma.series.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      include: {
        creator: true,
        seasons: {
          include: {
            episodes: {
              include: { video: { select: { id: true, masterPlaylistUrl: true, thumbnailUrl: true, durationSeconds: true } } },
              orderBy: { episodeNumber: 'asc' },
            },
          },
          orderBy: { seasonNumber: 'asc' },
        },
      },
    });
    if (!series) throw new NotFoundException('Série introuvable');
    return series;
  }
}
