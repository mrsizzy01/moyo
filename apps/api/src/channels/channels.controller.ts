import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  Query,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ChannelsService } from './channels.service';

@ApiTags('Channels')
@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Get(':slug')
  @ApiOperation({ summary: 'Obtenir la page d une chaîne par son slug' })
  async getChannel(
    @Param('slug') slug: string,
    @Headers('x-user-id') viewerId?: string,
  ) {
    const channel = await this.channelsService.getChannelBySlug(slug, viewerId);
    return { success: true, data: channel };
  }

  @Get(':slug/videos')
  @ApiOperation({ summary: 'Obtenir les vidéos d une chaîne' })
  async getChannelVideos(
    @Param('slug') slug: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const result = await this.channelsService.getChannelVideos(slug, Number(page), Number(limit));
    return { success: true, ...result };
  }

  @Get(':slug/series')
  @ApiOperation({ summary: 'Obtenir les séries d une chaîne' })
  async getChannelSeries(@Param('slug') slug: string) {
    const data = await this.channelsService.getChannelSeries(slug);
    return { success: true, data };
  }

  @Get(':slug/podcasts')
  @ApiOperation({ summary: 'Obtenir les podcasts d une chaîne' })
  async getChannelPodcasts(@Param('slug') slug: string) {
    const data = await this.channelsService.getChannelPodcasts(slug);
    return { success: true, data };
  }

  @Put(':slug')
  @ApiOperation({ summary: 'Mettre à jour le profil d une chaîne' })
  async updateChannel(
    @Param('slug') slug: string,
    @Headers('x-user-id') userId: string,
    @Body() body: any,
  ) {
    if (!userId) throw new UnauthorizedException('Utilisateur non identifié');
    const updated = await this.channelsService.updateChannel(slug, userId, body);
    return { success: true, data: updated, message: 'Chaîne mise à jour avec succès' };
  }
}
