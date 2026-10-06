import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { QueryVideosDto } from './dto/query-videos.dto';

@ApiTags('Videos')
@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les contenus multimédias publiés (avec filtres et pagination)' })
  @ApiResponse({ status: 200, description: 'Liste des vidéos' })
  async findAll(@Query() query: QueryVideosDto) {
    const result = await this.videosService.findAll(query);
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Obtenir les détails et variantes HLS d une vidéo par son ID ou slug' })
  @ApiResponse({ status: 200, description: 'Détails du média' })
  @ApiResponse({ status: 404, description: 'Vidéo introuvable' })
  async findOne(@Param('idOrSlug') idOrSlug: string) {
    const video = await this.videosService.findOne(idOrSlug);
    return {
      success: true,
      data: video,
      timestamp: new Date().toISOString(),
    };
  }

  @Post()
  @ApiOperation({ summary: 'Créer un contenu vidéo pour transcodage' })
  @ApiResponse({ status: 201, description: 'Contenu créé et mis en file d attente' })
  async create(@Body() dto: CreateVideoDto) {
    // Dans une version avec token actif, userId est extrait du JWT req.user.id
    // Pour l'initialisation, nous utilisons un identifiant système sécurisé
    const systemUserId = '00000000-0000-0000-0000-000000000001';
    const video = await this.videosService.create(systemUserId, dto);
    return {
      success: true,
      data: video,
      message: 'Vidéo mise en file de transcodage avec succès',
      timestamp: new Date().toISOString(),
    };
  }
}
