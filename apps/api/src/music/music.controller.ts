import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MusicService } from './music.service';

@ApiTags('Music')
@Controller('music')
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

  @Get('artists')
  @ApiOperation({ summary: 'Lister tous les artistes' })
  async getArtists() {
    return { success: true, data: await this.musicService.getArtists(), timestamp: new Date().toISOString() };
  }

  @Get('artists/:idOrSlug')
  @ApiOperation({ summary: 'Page artiste avec albums et top pistes' })
  async getArtist(@Param('idOrSlug') idOrSlug: string) {
    return { success: true, data: await this.musicService.getArtist(idOrSlug), timestamp: new Date().toISOString() };
  }

  @Get('albums/:id')
  @ApiOperation({ summary: 'Détail d un album avec ses pistes' })
  async getAlbum(@Param('id') id: string) {
    return { success: true, data: await this.musicService.getAlbum(id), timestamp: new Date().toISOString() };
  }

  @Get('tracks')
  @ApiOperation({ summary: 'Lister ou rechercher des pistes musicales' })
  async getTracks(@Query('q') query?: string) {
    return { success: true, data: await this.musicService.getTracks(query), timestamp: new Date().toISOString() };
  }
}
