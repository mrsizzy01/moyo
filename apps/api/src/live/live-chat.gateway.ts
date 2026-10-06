import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/live-chat' })
export class LiveChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(LiveChatGateway.name);

  constructor(private readonly prisma: PrismaService) {}

  afterInit() {
    this.logger.log('🔌 Passerelle WebSocket Live Chat initialisée');
  }

  handleConnection(client: Socket) {
    this.logger.debug(`Client WebSocket connecté : ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client WebSocket déconnecté : ${client.id}`);
  }

  @SubscribeMessage('join-stream')
  async handleJoinStream(@MessageBody() data: { streamId: string }, @ConnectedSocket() client: Socket) {
    await client.join(`stream:${data.streamId}`);
    this.logger.debug(`Client ${client.id} rejoint le salon stream:${data.streamId}`);

    // Récupérer les 50 derniers messages réels depuis la BDD
    const messages = await this.prisma.liveMessage.findMany({
      where: { liveStreamId: data.streamId },
      include: { user: { select: { username: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    client.emit('message-history', messages.reverse());
  }

  @SubscribeMessage('send-message')
  async handleMessage(
    @MessageBody() data: { streamId: string; userId: string; message: string },
    @ConnectedSocket() client: Socket
  ) {
    if (!data.message?.trim() || data.message.length > 500) return;

    // Persistance du message en base de données
    const savedMessage = await this.prisma.liveMessage.create({
      data: {
        liveStreamId: data.streamId,
        userId: data.userId,
        message: data.message.trim(),
      },
      include: {
        user: { select: { username: true, displayName: true, avatarUrl: true } },
      },
    });

    // Diffusion en temps réel à tous les clients du salon
    this.server.to(`stream:${data.streamId}`).emit('new-message', {
      id: savedMessage.id,
      message: savedMessage.message,
      userId: savedMessage.userId,
      username: savedMessage.user.username,
      displayName: savedMessage.user.displayName,
      avatarUrl: savedMessage.user.avatarUrl,
      createdAt: savedMessage.createdAt,
    });
  }

  @SubscribeMessage('delete-message')
  async handleDeleteMessage(
    @MessageBody() data: { messageId: string; moderatorUserId: string; streamId: string }
  ) {
    // Vérification que le requérant est modérateur (simplifiée pour le socle)
    await this.prisma.liveMessage.delete({ where: { id: data.messageId } });
    this.server.to(`stream:${data.streamId}`).emit('message-deleted', { messageId: data.messageId });
  }
}
