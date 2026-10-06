import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChannelsService {
  constructor(private readonly prisma: PrismaService) {}

  async getChannelBySlug(slug: string, viewerId?: string) {
    const channel = await this.prisma.creatorProfile.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            bannerUrl: true,
            createdAt: true,
          },
        },
        videos: {
          where: { status: 'PUBLISHED' },
          orderBy: { publishedAt: 'desc' },
          take: 12,
        },
        series: {
          where: { status: 'PUBLISHED' },
          take: 6,
        },
        podcasts: {
          take: 6,
        },
        liveStreams: {
          where: { status: 'LIVE' },
          take: 1,
        },
      },
    });

    if (!channel) {
      throw new NotFoundException(`Chaîne "${slug}" introuvable`);
    }

    let isSubscribed = false;
    if (viewerId) {
      const follow = await this.prisma.follow.findUnique({
        where: {
          followerId_creatorId: {
            followerId: viewerId,
            creatorId: channel.id,
          },
        },
      });
      isSubscribed = !!follow;
    }

    const totalVideos = await this.prisma.video.count({
      where: { creatorId: channel.id, status: 'PUBLISHED' },
    });

    return {
      ...channel,
      totalVideos,
      isSubscribed,
    };
  }

  async getChannelVideos(slug: string, page = 1, limit = 20) {
    const channel = await this.prisma.creatorProfile.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!channel) throw new NotFoundException(`Chaîne introuvable`);

    const skip = (page - 1) * limit;
    const [videos, total] = await Promise.all([
      this.prisma.video.findMany({
        where: { creatorId: channel.id, status: 'PUBLISHED' },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.video.count({
        where: { creatorId: channel.id, status: 'PUBLISHED' },
      }),
    ]);

    return {
      items: videos,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getChannelSeries(slug: string) {
    const channel = await this.prisma.creatorProfile.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!channel) throw new NotFoundException(`Chaîne introuvable`);

    return this.prisma.series.findMany({
      where: { creatorId: channel.id, status: 'PUBLISHED' },
      include: {
        seasons: {
          include: {
            episodes: {
              include: { video: true },
            },
          },
        },
      },
    });
  }

  async getChannelPodcasts(slug: string) {
    const channel = await this.prisma.creatorProfile.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!channel) throw new NotFoundException(`Chaîne introuvable`);

    return this.prisma.podcast.findMany({
      where: { creatorId: channel.id },
      include: {
        episodes: {
          orderBy: { episodeNumber: 'asc' },
        },
      },
    });
  }

  async updateChannel(
    slug: string,
    userId: string,
    data: {
      channelName?: string;
      bio?: string;
      avatarUrl?: string;
      bannerUrl?: string;
      websiteUrl?: string;
    },
  ) {
    const channel = await this.prisma.creatorProfile.findUnique({
      where: { slug },
    });
    if (!channel) throw new NotFoundException(`Chaîne introuvable`);
    if (channel.userId !== userId) {
      throw new ForbiddenException('Non autorisé à modifier cette chaîne');
    }

    return this.prisma.creatorProfile.update({
      where: { id: channel.id },
      data,
    });
  }
}
