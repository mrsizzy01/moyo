import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlaylistsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: { title: string; description?: string; isPublic?: boolean }) {
    return this.prisma.playlist.create({
      data: {
        title: data.title,
        description: data.description,
        isPublic: data.isPublic ?? true,
        userId,
      },
    });
  }

  async getUserPlaylists(userId: string) {
    return this.prisma.playlist.findMany({
      where: { userId },
      include: {
        items: {
          take: 4,
          include: {
            video: {
              select: {
                id: true,
                title: true,
                thumbnailUrl: true,
                durationSeconds: true,
              },
            },
          },
          orderBy: { position: 'asc' },
        },
        _count: {
          select: { items: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getById(id: string, viewerId?: string) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, username: true, displayName: true, avatarUrl: true },
        },
        items: {
          include: {
            video: {
              include: {
                creator: {
                  select: { id: true, channelName: true, slug: true, avatarUrl: true },
                },
              },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!playlist) throw new NotFoundException('Playlist introuvable');
    if (!playlist.isPublic && playlist.userId !== viewerId) {
      throw new ForbiddenException('Cette playlist est privée');
    }

    return playlist;
  }

  async addVideo(playlistId: string, videoId: string, userId: string) {
    const playlist = await this.prisma.playlist.findUnique({ where: { id: playlistId } });
    if (!playlist) throw new NotFoundException('Playlist introuvable');
    if (playlist.userId !== userId) throw new ForbiddenException('Non autorisé');

    const count = await this.prisma.playlistItem.count({ where: { playlistId } });

    return this.prisma.playlistItem.upsert({
      where: {
        playlistId_videoId: { playlistId, videoId },
      },
      create: {
        playlistId,
        videoId,
        position: count,
      },
      update: {},
    });
  }

  async removeVideo(playlistId: string, videoId: string, userId: string) {
    const playlist = await this.prisma.playlist.findUnique({ where: { id: playlistId } });
    if (!playlist) throw new NotFoundException('Playlist introuvable');
    if (playlist.userId !== userId) throw new ForbiddenException('Non autorisé');

    return this.prisma.playlistItem.deleteMany({
      where: { playlistId, videoId },
    });
  }

  async delete(playlistId: string, userId: string) {
    const playlist = await this.prisma.playlist.findUnique({ where: { id: playlistId } });
    if (!playlist) throw new NotFoundException('Playlist introuvable');
    if (playlist.userId !== userId) throw new ForbiddenException('Non autorisé');

    return this.prisma.playlist.delete({
      where: { id: playlistId },
    });
  }
}
