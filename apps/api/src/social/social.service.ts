import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SocialService {
  constructor(private readonly prisma: PrismaService) {}

  // === LIKES ===
  async toggleLike(userId: string, videoId: string) {
    const existing = await this.prisma.like.findUnique({ where: { userId_videoId: { userId, videoId } } });

    if (existing) {
      await this.prisma.like.delete({ where: { userId_videoId: { userId, videoId } } });
      await this.prisma.video.update({ where: { id: videoId }, data: { likesCount: { decrement: 1 } } });
      return { liked: false };
    } else {
      await this.prisma.like.create({ data: { userId, videoId } });
      await this.prisma.video.update({ where: { id: videoId }, data: { likesCount: { increment: 1 } } });
      return { liked: true };
    }
  }

  // === COMMENTAIRES ===
  async getComments(videoId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { videoId, parentId: null },
        include: {
          user: { select: { username: true, displayName: true, avatarUrl: true } },
          replies: {
            include: { user: { select: { username: true, displayName: true, avatarUrl: true } } },
            orderBy: { createdAt: 'asc' },
            take: 5,
          },
          _count: { select: { replies: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.comment.count({ where: { videoId, parentId: null } }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async createComment(userId: string, videoId: string, content: string, parentId?: string) {
    if (!content?.trim() || content.length > 2000) throw new ConflictException('Commentaire invalide');

    const comment = await this.prisma.comment.create({
      data: { userId, videoId, content: content.trim(), parentId },
      include: { user: { select: { username: true, displayName: true, avatarUrl: true } } },
    });

    await this.prisma.video.update({ where: { id: videoId }, data: { commentsCount: { increment: 1 } } });
    return comment;
  }

  // === SUIVRE UN CRÉATEUR ===
  async toggleFollow(followerId: string, creatorId: string) {
    const existing = await this.prisma.follow.findUnique({ where: { followerId_creatorId: { followerId, creatorId } } });

    if (existing) {
      await this.prisma.follow.delete({ where: { followerId_creatorId: { followerId, creatorId } } });
      await this.prisma.creatorProfile.update({ where: { id: creatorId }, data: { subscribersCount: { decrement: 1 } } });
      return { following: false };
    } else {
      await this.prisma.follow.create({ data: { followerId, creatorId } });
      await this.prisma.creatorProfile.update({ where: { id: creatorId }, data: { subscribersCount: { increment: 1 } } });
      return { following: true };
    }
  }

  // === HISTORIQUE ===
  async updateWatchHistory(userId: string, videoId: string, progressSeconds: number) {
    await this.prisma.watchHistory.upsert({
      where: { userId_videoId: { userId, videoId } },
      create: { userId, videoId, progressSeconds },
      update: { progressSeconds },
    });
  }

  async getWatchHistory(userId: string) {
    return this.prisma.watchHistory.findMany({
      where: { userId },
      include: {
        video: { select: { id: true, title: true, slug: true, thumbnailUrl: true, durationSeconds: true, mediaType: true, creator: { select: { channelName: true } } } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 30,
    });
  }
}
