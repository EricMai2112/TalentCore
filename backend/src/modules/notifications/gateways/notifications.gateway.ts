import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
@Injectable()
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('NotificationsGateway');

  afterInit(server: Server) {
    this.logger.log('🔔 Notifications WebSocket Gateway Initialized');
  }

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    const role = client.handshake.query.role as string;
    const departmentId = client.handshake.query.departmentId as string;

    if (userId) {
      client.join(`user:${userId}`);
      this.logger.log(`Client ${client.id} joined user:${userId}`);
    }
    if (role) {
      client.join(`role:${role}`);
      this.logger.log(`Client ${client.id} joined role:${role}`);
    }
    if (departmentId) {
      client.join(`dept:${departmentId}`);
      this.logger.log(`Client ${client.id} joined dept:${departmentId}`);
    }

    this.logger.log(`Client connected to notifications: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected from notifications: ${client.id}`);
  }

  @SubscribeMessage('join_user_channel')
  handleJoinChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId?: string; role?: string; departmentId?: string },
  ) {
    if (data.userId) {
      client.join(`user:${data.userId}`);
      this.logger.log(`Socket ${client.id} manually joined user:${data.userId}`);
    }
    if (data.role) {
      client.join(`role:${data.role}`);
      this.logger.log(`Socket ${client.id} manually joined role:${data.role}`);
    }
    if (data.departmentId) {
      client.join(`dept:${data.departmentId}`);
      this.logger.log(`Socket ${client.id} manually joined dept:${data.departmentId}`);
    }
    return { status: 'ok', joined: data };
  }

  sendToUser(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification:new', notification);
    this.logger.log(`Pushed notification to user:${userId} - Title: "${notification.title}"`);
  }

  sendToRole(role: string, notification: any) {
    this.server.to(`role:${role}`).emit('notification:new', notification);
    this.logger.log(`Pushed notification to role:${role} - Title: "${notification.title}"`);
  }

  sendToDepartment(departmentId: string, notification: any) {
    this.server.to(`dept:${departmentId}`).emit('notification:new', notification);
    this.logger.log(`Pushed notification to dept:${departmentId} - Title: "${notification.title}"`);
  }

  emitUnreadCount(userId: string, count: number) {
    this.server.to(`user:${userId}`).emit('notification:unreadCount', { count });
  }
}
