import { Controller, Get, Post, Put, Delete, Param, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { QueryVideosDto } from './dto/query-videos.dto';

@ApiTags('Videos')
@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les vidéos publiées (avec filtres et pagination)' })
  async findAll(@Query() query: QueryVideosDto) {
    return { success: true, data: await this.videosService.findAll(query), timestamp: new Date().toISOString() };
  }

  @Get('my')
  @ApiOperation({ summary: 'Vidéos de l utilisateur connecté (studio)' })
  async getMyVideos(@Query('userId') userId: string) {
    return { success: true, data: await this.videosService.getMyVideos(userId) };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une vidéo par ID ou slug' })
  async findOne(@Param('id') id: string) {
    return { success: true, data: await this.videosService.findOne(id), timestamp: new Date().toISOString() };
  }

  @Post()
  @ApiOperation({ summary: 'Créer une vidéo et enqueuer le transcodage' })
  async create(@Body() body: { userId: string } & CreateVideoDto) {
    const { userId, ...dto } = body;
    return { success: true, data: await this.videosService.create(userId, dto), message: 'Vidéo créée. Transcodage en cours.', timestamp: new Date().toISOString() };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier les métadonnées d une vidéo' })
  async update(@Param('id') id: string, @Body() body: { userId: string; title?: string; description?: string; tags?: string[]; status?: string }) {
    const { userId, ...data } = body;
    return { success: true, data: await this.videosService.update(id, userId, data) };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer (soft delete) une vidéo' })
  async remove(@Param('id') id: string, @Body() body: { userId: string }) {
    return { success: true, data: await this.videosService.remove(id, body.userId) };
  }
}
