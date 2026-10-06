import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SearchResults {
  videos: any[];
  series: any[];
  artists: any[];
  podcasts: any[];
  creators: any[];
  totalResults: number;
}

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async globalSearch(query: string): Promise<SearchResults> {
    if (!query || query.trim().length < 2) {
      return { videos: [], series: [], artists: [], podcasts: [], creators: [], totalResults: 0 };
    }

    const q = query.trim();
    const searchFilter = { contains: q, mode: 'insensitive' as const };

    const [videos, series, artists, podcasts, creators] = await Promise.all([
      this.prisma.video.findMany({
        where: { status: 'PUBLISHED', OR: [{ title: searchFilter }, { description: searchFilter }] },
        select: { id: true, title: true, slug: true, thumbnailUrl: true, mediaType: true, durationSeconds: true, viewsCount: true, creator: { select: { channelName: true, slug: true } } },
        take: 10,
      }),

      this.prisma.series.findMany({
        where: { status: 'PUBLISHED', OR: [{ title: searchFilter }, { description: searchFilter }] },
        select: { id: true, title: true, slug: true, bannerUrl: true, creator: { select: { channelName: true } }, seasons: { select: { id: true }, take: 1 } },
        take: 8,
      }),

      this.prisma.artist.findMany({
        where: { OR: [{ name: searchFilter }, { bio: searchFilter }] },
        select: { id: true, name: true, slug: true, avatarUrl: true, _count: { select: { albums: true, tracks: true } } },
        take: 8,
      }),

      this.prisma.podcast.findMany({
        where: { OR: [{ title: searchFilter }, { description: searchFilter }] },
        select: { id: true, title: true, slug: true, coverUrl: true, creator: { select: { channelName: true } }, _count: { select: { episodes: true } } },
        take: 8,
      }),

      this.prisma.creatorProfile.findMany({
        where: { OR: [{ channelName: searchFilter }, { bio: searchFilter }] },
        select: { id: true, channelName: true, slug: true, avatarUrl: true, isVerified: true, subscribersCount: true },
        take: 6,
      }),
    ]);

    return {
      videos,
      series,
      artists,
      podcasts,
      creators,
      totalResults: videos.length + series.length + artists.length + podcasts.length + creators.length,
    };
  }
}
