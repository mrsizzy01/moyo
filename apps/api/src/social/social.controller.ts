import { Controller, Post, Get, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SocialService } from './social.service';

@ApiTags('Social')
@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Post('likes/:videoId')
  @ApiOperation({ summary: 'Aimer ou retirer le like d une vidéo' })
  async toggleLike(@Param('videoId') videoId: string, @Body() body: { userId: string }) {
    return { success: true, data: await this.socialService.toggleLike(body.userId, videoId) };
  }

  @Get('comments/:videoId')
  @ApiOperation({ summary: 'Récupérer les commentaires d une vidéo' })
  async getComments(@Param('videoId') videoId: string, @Query('page') page?: string) {
    return { success: true, data: await this.socialService.getComments(videoId, page ? parseInt(page) : 1) };
  }

  @Post('comments/:videoId')
  @ApiOperation({ summary: 'Publier un commentaire sur une vidéo' })
  async createComment(@Param('videoId') videoId: string, @Body() body: { userId: string; content: string; parentId?: string }) {
    return { success: true, data: await this.socialService.createComment(body.userId, videoId, body.content, body.parentId) };
  }

  @Post('follow/:creatorId')
  @ApiOperation({ summary: 'Suivre ou ne plus suivre un créateur' })
  async toggleFollow(@Param('creatorId') creatorId: string, @Body() body: { followerId: string }) {
    return { success: true, data: await this.socialService.toggleFollow(body.followerId, creatorId) };
  }

  @Post('history')
  @ApiOperation({ summary: 'Enregistrer la progression de visionnage' })
  async updateHistory(@Body() body: { userId: string; videoId: string; progressSeconds: number }) {
    await this.socialService.updateWatchHistory(body.userId, body.videoId, body.progressSeconds);
    return { success: true };
  }

  @Get('history/:userId')
  @ApiOperation({ summary: 'Récupérer l historique de visionnage d un utilisateur' })
  async getHistory(@Param('userId') userId: string) {
    return { success: true, data: await this.socialService.getWatchHistory(userId) };
  }
}
