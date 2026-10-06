import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Query,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer les notifications de l utilisateur' })
  async getNotifications(
    @Headers('x-user-id') userId: string,
    @Query('limit') limit = 30,
  ) {
    if (!userId) throw new UnauthorizedException('Utilisateur non identifié');
    const notifications = await this.notificationsService.getUserNotifications(userId, Number(limit));
    const unreadCount = await this.notificationsService.getUnreadCount(userId);
    return {
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marquer une notification comme lue' })
  async markAsRead(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) throw new UnauthorizedException('Utilisateur non identifié');
    await this.notificationsService.markAsRead(id, userId);
    return { success: true, message: 'Notification marquée comme lue' };
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Marquer toutes les notifications comme lues' })
  async markAllAsRead(@Headers('x-user-id') userId: string) {
    if (!userId) throw new UnauthorizedException('Utilisateur non identifié');
    await this.notificationsService.markAllAsRead(userId);
    return { success: true, message: 'Toutes les notifications marquées comme lues' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une notification' })
  async deleteNotification(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) throw new UnauthorizedException('Utilisateur non identifié');
    await this.notificationsService.delete(id, userId);
    return { success: true, message: 'Notification supprimée' };
  }
}
