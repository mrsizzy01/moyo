import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LiveService } from './live.service';

@ApiTags('Live')
@Controller('live')
export class LiveController {
  constructor(private readonly liveService: LiveService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les directs actifs en ce moment' })
  async getActiveStreams() {
    return { success: true, data: await this.liveService.getActiveStreams(), timestamp: new Date().toISOString() };
  }

  @Get('scheduled')
  @ApiOperation({ summary: 'Lister les directs programmés à venir' })
  async getScheduled() {
    return { success: true, data: await this.liveService.getScheduled(), timestamp: new Date().toISOString() };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d un flux en direct' })
  async getStream(@Param('id') id: string) {
    return { success: true, data: await this.liveService.getStream(id), timestamp: new Date().toISOString() };
  }

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau direct (requiert profil créateur)' })
  async createStream(@Body() body: { userId: string; title: string; description?: string; scheduledFor?: string; isChatEnabled?: boolean; isRecordingEnabled?: boolean }) {
    const stream = await this.liveService.createStream(body.userId, {
      ...body,
      scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : undefined,
    });
    return { success: true, data: stream, message: 'Direct créé. Configurez OBS avec votre clé de stream.', timestamp: new Date().toISOString() };
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Démarrer un direct' })
  async startStream(@Param('id') id: string, @Body() body: { userId: string }) {
    return { success: true, data: await this.liveService.startStream(id, body.userId), timestamp: new Date().toISOString() };
  }

  @Post(':id/end')
  @ApiOperation({ summary: 'Terminer un direct' })
  async endStream(@Param('id') id: string, @Body() body: { userId: string }) {
    return { success: true, data: await this.liveService.endStream(id, body.userId), timestamp: new Date().toISOString() };
  }
}
