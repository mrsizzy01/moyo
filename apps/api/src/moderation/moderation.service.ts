import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportReason } from '@moyo/types';

@Injectable()
export class ModerationService {
  constructor(private readonly prisma: PrismaService) {}

  async createReport(reporterId: string, targetType: string, targetId: string, reason: ReportReason, details?: string) {
    return this.prisma.report.create({
      data: { reporterId, targetType, targetId, reason, details },
    });
  }

  async getReports(status?: string) {
    return this.prisma.report.findMany({
      where: status ? { status: status as any } : undefined,
      include: { reporter: { select: { username: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async resolveReport(reportId: string, action: 'RESOLVED' | 'DISMISSED', adminUserId: string, note?: string) {
    const report = await this.prisma.report.update({
      where: { id: reportId },
      data: { status: action, updatedAt: new Date() },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: `REPORT_${action}`,
        resource: 'Report',
        resourceId: reportId,
        metadata: { note },
      },
    });

    return report;
  }
}
