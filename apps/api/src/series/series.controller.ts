import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SeriesService } from './series.service';

@ApiTags('Series')
@Controller('series')
export class SeriesController {
  constructor(private readonly seriesService: SeriesService) {}

  @Get()
  @ApiOperation({ summary: 'Lister toutes les séries publiées' })
  async findAll() {
    return { success: true, data: await this.seriesService.findAll(), timestamp: new Date().toISOString() };
  }

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Obtenir une série complète avec ses saisons et épisodes' })
  async findOne(@Param('idOrSlug') idOrSlug: string) {
    return { success: true, data: await this.seriesService.findOne(idOrSlug), timestamp: new Date().toISOString() };
  }
}
