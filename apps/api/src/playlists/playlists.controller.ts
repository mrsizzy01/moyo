import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PlaylistsService } from './playlists.service';

@ApiTags('Playlists')
@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Get('my')
  @ApiOperation({ summary: 'Obtenir les playlists de l utilisateur connecté' })
  async getMyPlaylists(@Headers('x-user-id') userId: string) {
    if (!userId) throw new UnauthorizedException('Utilisateur non identifié');
    const playlists = await this.playlistsService.getUserPlaylists(userId);
    return { success: true, data: playlists };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une playlist par son ID' })
  async getPlaylist(
    @Param('id') id: string,
    @Headers('x-user-id') viewerId?: string,
  ) {
    const playlist = await this.playlistsService.getById(id, viewerId);
    return { success: true, data: playlist };
  }

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle playlist' })
  async createPlaylist(
    @Headers('x-user-id') userId: string,
    @Body() body: { title: string; description?: string; isPublic?: boolean },
  ) {
    if (!userId) throw new UnauthorizedException('Utilisateur non identifié');
    const playlist = await this.playlistsService.create(userId, body);
    return { success: true, data: playlist, message: 'Playlist créée avec succès' };
  }

  @Post(':id/videos')
  @ApiOperation({ summary: 'Ajouter une vidéo à la playlist' })
  async addVideo(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
    @Body('videoId') videoId: string,
  ) {
    if (!userId) throw new UnauthorizedException('Utilisateur non identifié');
    await this.playlistsService.addVideo(id, videoId, userId);
    return { success: true, message: 'Vidéo ajoutée à la playlist' };
  }

  @Delete(':id/videos/:videoId')
  @ApiOperation({ summary: 'Retirer une vidéo de la playlist' })
  async removeVideo(
    @Param('id') id: string,
    @Param('videoId') videoId: string,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) throw new UnauthorizedException('Utilisateur non identifié');
    await this.playlistsService.removeVideo(id, videoId, userId);
    return { success: true, message: 'Vidéo retirée de la playlist' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une playlist' })
  async deletePlaylist(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) throw new UnauthorizedException('Utilisateur non identifié');
    await this.playlistsService.delete(id, userId);
    return { success: true, message: 'Playlist supprimée avec succès' };
  }
}
