import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { WorkSession, SessionStatus } from '../../entities/work-session.entity';
import { StartSessionDto } from './dto/session.dto';
import logger from '../../config/logger.config';

@Injectable()
export class SessionsService {
    constructor(
        @InjectRepository(WorkSession)
        private readonly sessionRepository: Repository<WorkSession>,
        private readonly dataSource: DataSource,
    ) { }

    async startSession(userId: string, organizationId: string, dto: StartSessionDto) {
        logger.info({ userId, organizationId }, 'Starting work session');

        // Check if user already has an active session
        const activeSession = await this.sessionRepository.findOne({
            where: {
                user_id: userId,
                status: SessionStatus.ACTIVE,
            },
        });

        if (activeSession) {
            throw new ConflictException('User already has an active session');
        }

        // Start transaction
        return await this.dataSource.transaction(async (manager) => {
            const session = manager.create(WorkSession, {
                user_id: userId,
                organization_id: organizationId,
                project_id: dto.project_id || null,
                start_time: new Date(),
                status: SessionStatus.ACTIVE,
                last_activity_at: new Date(),
                total_active_seconds: 0,
                total_idle_seconds: 0,
            });

            const savedSession = await manager.save(session);

            logger.info({ sessionId: savedSession.id, userId }, 'Work session started');

            return savedSession;
        });
    }

    async stopSession(sessionId: string, userId: string) {
        logger.info({ sessionId, userId }, 'Stopping work session');

        // Use transaction for consistency
        return await this.dataSource.transaction(async (manager) => {
            const session = await manager.findOne(WorkSession, {
                where: { id: sessionId, user_id: userId },
            });

            if (!session) {
                throw new NotFoundException('Session not found');
            }

            if (session.status === SessionStatus.STOPPED) {
                throw new BadRequestException('Session is already stopped');
            }

            // Set end_time and mark as stopped
            session.end_time = new Date();
            session.status = SessionStatus.STOPPED;

            const stoppedSession = await manager.save(session);

            logger.info({ sessionId, userId }, 'Work session stopped');

            return stoppedSession;
        });
    }

    async getActiveSessions(organizationId: string) {
        return await this.sessionRepository.find({
            where: {
                organization_id: organizationId,
                status: SessionStatus.ACTIVE,
            },
            order: {
                start_time: 'DESC',
            },
        });
    }

    async getSessionById(sessionId: string, userId: string) {
        const session = await this.sessionRepository.findOne({
            where: { id: sessionId, user_id: userId },
        });

        if (!session) {
            throw new NotFoundException('Session not found');
        }

        return session;
    }
}
