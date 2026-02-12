import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkSession } from '../../entities/work-session.entity';
import logger from '../../config/logger.config';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private redis: Redis;

    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        @InjectRepository(WorkSession)
        private readonly sessionRepository: Repository<WorkSession>,
    ) {
        this.redis = new Redis({
            host: configService.get<string>('redis.host'),
            port: configService.get<number>('redis.port'),
        });
    }

    async handleConnection(client: Socket) {
        try {
            const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];

            if (!token) {
                client.disconnect();
                return;
            }

            const payload = this.jwtService.verify(token);
            const userId = payload.sub;
            const organizationId = payload.organization_id;

            // Store user info in socket
            client.data.userId = userId;
            client.data.organizationId = organizationId;

            // Join user-specific and organization-specific rooms
            client.join(`user:${userId}`);
            client.join(`organization:${organizationId}`);

            // Track online status in Redis
            await this.redis.sadd(`online:${organizationId}`, userId);

            // Emit user online event
            this.server.to(`organization:${organizationId}`).emit('USER_ONLINE', {
                userId,
                timestamp: new Date(),
            });

            // Send current session state if exists
            const activeSession = await this.sessionRepository.findOne({
                where: { user_id: userId, status: 'active' as any },
            });

            if (activeSession) {
                client.emit('SESSION_UPDATE', {
                    session: activeSession,
                });
            }

            logger.info({ userId, organizationId }, 'WebSocket client connected');
        } catch (error) {
            logger.error({ error: error.message }, 'WebSocket authentication failed');
            client.disconnect();
        }
    }

    async handleDisconnect(client: Socket) {
        const userId = client.data.userId;
        const organizationId = client.data.organizationId;

        if (userId && organizationId) {
            // Remove from online set
            await this.redis.srem(`online:${organizationId}`, userId);

            // Emit user offline event
            this.server.to(`organization:${organizationId}`).emit('USER_OFFLINE', {
                userId,
                timestamp: new Date(),
            });

            logger.info({ userId, organizationId }, 'WebSocket client disconnected');
        }
    }

    emitToUser(userId: string, event: string, data: any) {
        this.server.to(`user:${userId}`).emit(event, data);
    }

    emitToOrganization(organizationId: string, event: string, data: any) {
        this.server.to(`organization:${organizationId}`).emit(event, data);
    }

    async getOnlineUsers(organizationId: string): Promise<string[]> {
        return this.redis.smembers(`online:${organizationId}`);
    }
}
