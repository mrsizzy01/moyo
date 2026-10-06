import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PodcastsService } from './podcasts.service';

@ApiTags('Podcasts')
@Controller('podcasts')
export class PodcastsController {
  constructor(private readonly podcastsService: PodcastsService) {}

  @Get()
  @ApiOperation({ summary: 'Lister tous les podcasts' })
  async findAll() {
    return { success: true, data: await this.podcastsService.findAll(), timestamp: new Date().toISOString() };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d un podcast avec tous ses épisodes' })
  async findOne(@Param('id') id: string) {
    return { success: true, data: await this.podcastsService.findOne(id), timestamp: new Date().toISOString() };
  }
}
