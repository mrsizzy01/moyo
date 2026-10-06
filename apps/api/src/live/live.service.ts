import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { LiveStatus } from '@moyo/types';
import { randomUUID } from 'crypto';

@Injectable()
export class LiveService {
  private readonly logger = new Logger(LiveService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getActiveStreams() {
    return this.prisma.liveStream.findMany({
      where: { status: LiveStatus.LIVE },
      include: { creator: { select: { id: true, channelName: true, slug: true, avatarUrl: true } } },
      orderBy: { startedAt: 'desc' },
    });
  }

  async getScheduled() {
    return this.prisma.liveStream.findMany({
      where: { status: LiveStatus.SCHEDULED, scheduledFor: { gt: new Date() } },
      include: { creator: { select: { id: true, channelName: true, slug: true, avatarUrl: true } } },
      orderBy: { scheduledFor: 'asc' },
    });
  }

  async getStream(id: string) {
    const stream = await this.prisma.liveStream.findUnique({
      where: { id },
      include: {
        creator: true,
        sessions: { orderBy: { startedAt: 'desc' }, take: 1 },
      },
    });
    if (!stream) throw new NotFoundException('Flux en direct introuvable');
    return stream;
  }

  async createStream(userId: string, data: { title: string; description?: string; scheduledFor?: Date; isChatEnabled?: boolean; isRecordingEnabled?: boolean }) {
    const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (!creator) throw new ForbiddenException('Profil créateur requis pour créer un direct');

    const streamKey = randomUUID().replace(/-/g, '');

    const stream = await this.prisma.liveStream.create({
      data: {
        title: data.title,
        description: data.description,
        streamKey,
        status: LiveStatus.SCHEDULED,
        scheduledFor: data.scheduledFor,
        isChatEnabled: data.isChatEnabled ?? true,
        isRecordingEnabled: data.isRecordingEnabled ?? true,
        creatorId: creator.id,
      },
    });

    this.logger.log(`Live créé : ${stream.id} par créateur ${creator.id}, clé de stream : ${streamKey}`);
    return stream;
  }

  async startStream(liveStreamId: string, userId: string) {
    const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (!creator) throw new ForbiddenException('Profil créateur introuvable');

    const stream = await this.prisma.liveStream.findUnique({ where: { id: liveStreamId } });
    if (!stream || stream.creatorId !== creator.id) throw new ForbiddenException('Accès non autorisé');

    const [updated] = await Promise.all([
      this.prisma.liveStream.update({
        where: { id: liveStreamId },
        data: { status: LiveStatus.LIVE, startedAt: new Date(), hlsPlaybackUrl: `/live_hls/${stream.streamKey}/index.m3u8` },
      }),
      this.prisma.liveSession.create({ data: { liveStreamId, startedAt: new Date() } }),
    ]);

    this.logger.log(`Direct démarré : ${liveStreamId}`);
    return updated;
  }

  async endStream(liveStreamId: string, userId: string) {
    const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });
    if (!creator) throw new ForbiddenException('Profil créateur introuvable');

    const stream = await this.prisma.liveStream.findUnique({ where: { id: liveStreamId } });
    if (!stream || stream.creatorId !== creator.id) throw new ForbiddenException('Accès non autorisé');

    const updated = await this.prisma.liveStream.update({
      where: { id: liveStreamId },
      data: { status: LiveStatus.ENDED, endedAt: new Date() },
    });

    await this.prisma.liveSession.updateMany({
      where: { liveStreamId, endedAt: null },
      data: { endedAt: new Date() },
    });

    this.logger.log(`Direct terminé : ${liveStreamId}`);
    return updated;
  }
}
