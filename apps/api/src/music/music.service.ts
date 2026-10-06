import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MusicService {
  constructor(private readonly prisma: PrismaService) {}

  async getArtists() {
    return this.prisma.artist.findMany({
      include: { albums: { select: { id: true, title: true, coverUrl: true, year: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async getArtist(idOrSlug: string) {
    const artist = await this.prisma.artist.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      include: {
        albums: {
          include: { tracks: { orderBy: { trackNumber: 'asc' } } },
          orderBy: { year: 'desc' },
        },
        tracks: { orderBy: { playsCount: 'desc' }, take: 10 },
      },
    });
    if (!artist) throw new NotFoundException('Artiste introuvable');
    return artist;
  }

  async getAlbum(id: string) {
    const album = await this.prisma.album.findUnique({
      where: { id },
      include: {
        artist: true,
        tracks: { orderBy: { trackNumber: 'asc' } },
      },
    });
    if (!album) throw new NotFoundException('Album introuvable');
    return album;
  }

  async getTracks(query?: string) {
    return this.prisma.track.findMany({
      where: query ? { title: { contains: query, mode: 'insensitive' } } : undefined,
      include: {
        artist: { select: { id: true, name: true, slug: true } },
        album: { select: { id: true, title: true, coverUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
