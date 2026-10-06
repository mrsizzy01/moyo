import { Controller, Post, Get, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ModerationService } from './moderation.service';
import { ReportReason } from '@moyo/types';

@ApiTags('Moderation')
@Controller('moderation')
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Post('reports')
  @ApiOperation({ summary: 'Signaler un contenu ou utilisateur' })
  async createReport(@Body() body: { reporterId: string; targetType: string; targetId: string; reason: ReportReason; details?: string }) {
    return { success: true, data: await this.moderationService.createReport(body.reporterId, body.targetType, body.targetId, body.reason, body.details), message: 'Signalement enregistré. Notre équipe examinera ce contenu.' };
  }

  @Get('reports')
  @ApiOperation({ summary: 'Lister les signalements (réservé aux modérateurs/admins)' })
  async getReports(@Query('status') status?: string) {
    return { success: true, data: await this.moderationService.getReports(status) };
  }

  @Patch('reports/:id/resolve')
  @ApiOperation({ summary: 'Résoudre ou rejeter un signalement' })
  async resolveReport(@Param('id') id: string, @Body() body: { action: 'RESOLVED' | 'DISMISSED'; adminUserId: string; note?: string }) {
    return { success: true, data: await this.moderationService.resolveReport(id, body.action, body.adminUserId, body.note) };
  }
}
