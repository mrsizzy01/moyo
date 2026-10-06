import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getGlobalStats() {
    const [
      totalUsers,
      totalCreators,
      totalVideos,
      publishedVideos,
      totalSeries,
      totalTracks,
      totalPodcasts,
      totalLives,
      pendingReports,
      viewsAggregate,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.creatorProfile.count(),
      this.prisma.video.count(),
      this.prisma.video.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.series.count(),
      this.prisma.track.count(),
      this.prisma.podcast.count(),
      this.prisma.liveStream.count(),
      this.prisma.report.count({ where: { status: 'PENDING' } }),
      this.prisma.video.aggregate({
        _sum: {
          viewsCount: true,
          likesCount: true,
        },
      }),
    ]);

    return {
      users: {
        total: totalUsers,
        creators: totalCreators,
      },
      content: {
        totalVideos,
        publishedVideos,
        totalSeries,
        totalTracks,
        totalPodcasts,
        totalLives,
      },
      engagement: {
        totalViews: viewsAggregate._sum.viewsCount || 0,
        totalLikes: viewsAggregate._sum.likesCount || 0,
      },
      moderation: {
        pendingReports,
      },
    };
  }

  async getUsers(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          role: true,
          isActive: true,
          createdAt: true,
          creatorProfile: {
            select: { id: true, channelName: true, slug: true, subscribersCount: true },
          },
          _count: {
            select: { videos: true, comments: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateUserRole(userId: string, role: any, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'UPDATE_USER_ROLE',
        resource: 'User',
        resourceId: userId,
        metadata: { oldRole: user.role, newRole: role },
        userId: adminId,
      },
    });

    return updated;
  }

  async toggleUserStatus(userId: string, isActive: boolean, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });

    await this.prisma.auditLog.create({
      data: {
        action: isActive ? 'ACTIVATE_USER' : 'SUSPEND_USER',
        resource: 'User',
        resourceId: userId,
        metadata: { previousStatus: user.isActive },
        userId: adminId,
      },
    });

    return updated;
  }

  async getReports(status?: any, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        include: {
          reporter: {
            select: { id: true, username: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async handleReport(reportId: string, action: 'RESOLVE' | 'DISMISS', adminId: string) {
    const report = await this.prisma.report.findUnique({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Signalement introuvable');

    const newStatus = action === 'RESOLVE' ? 'RESOLVED' : 'DISMISSED';

    const updated = await this.prisma.report.update({
      where: { id: reportId },
      data: { status: newStatus },
    });

    await this.prisma.auditLog.create({
      data: {
        action: `REPORT_${action}`,
        resource: 'Report',
        resourceId: reportId,
        metadata: { targetType: report.targetType, targetId: report.targetId, reason: report.reason },
        userId: adminId,
      },
    });

    return updated;
  }

  async getAuditLogs(page = 1, limit = 30) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        include: {
          user: {
            select: { id: true, username: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count(),
    ]);

    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
