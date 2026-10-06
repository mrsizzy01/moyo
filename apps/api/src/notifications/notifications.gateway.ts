import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private userSockets = new Map<string, Set<string>>(); // userId -> Set<socketId>

  handleConnection(client: Socket) {
    this.logger.log(`Client connecté aux notifications : ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketIds] of this.userSockets.entries()) {
      if (socketIds.has(client.id)) {
        socketIds.delete(client.id);
        if (socketIds.size === 0) {
          this.userSockets.delete(userId);
        }
        break;
      }
    }
    this.logger.log(`Client déconnecté des notifications : ${client.id}`);
  }

  @SubscribeMessage('authenticate')
  handleAuthenticate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    if (!data?.userId) return;
    if (!this.userSockets.has(data.userId)) {
      this.userSockets.set(data.userId, new Set());
    }
    this.userSockets.get(data.userId)!.add(client.id);
    client.join(`user:${data.userId}`);
    this.logger.log(`Utilisateur ${data.userId} authentifié sur le socket ${client.id}`);
  }

  sendToUser(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }

  broadcast(event: string, payload: any) {
    this.server.emit(event, payload);
  }
}
