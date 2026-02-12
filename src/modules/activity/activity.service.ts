import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, OptimisticLockVersionMismatchError } from 'typeorm';
import { WorkSession, SessionStatus } from '../../entities/work-session.entity';
import { ActivityLog, ActivityType } from '../../entities/activity-log.entity';
import { LogActivityDto, BatchActivityDto } from './dto/activity.dto';
import logger from '../../config/logger.config';

@Injectable()
export class ActivityService {
    private readonly MAX_RETRIES = 3;
    private readonly RETRY_DELAY_MS = 100;

    constructor(
        @InjectRepository(WorkSession)
        private readonly sessionRepository: Repository<WorkSession>,
        @InjectRepository(ActivityLog)
        private readonly activityLogRepository: Repository<ActivityLog>,
        private readonly dataSource: DataSource,
    ) { }

    async logActivity(sessionId: string, userId: string, dto: LogActivityDto) {
        return this.logActivityWithRetry(sessionId, userId, dto, 0);
    }

    private async logActivityWithRetry(
        sessionId: string,
        userId: string,
        dto: LogActivityDto,
        attempt: number,
    ): Promise<{ session: WorkSession; activity: ActivityLog }> {
        try {
            return await this.dataSource.transaction(async (manager) => {
                // Fetch session with lock
                const session = await manager.findOne(WorkSession, {
                    where: { id: sessionId, user_id: userId },
                });

                if (!session) {
                    throw new NotFoundException('Session not found');
                }

                if (session.status === SessionStatus.STOPPED) {
                    throw new BadRequestException('Cannot log activity to a stopped session');
                }

                // Update session totals
                if (dto.activityType === ActivityType.ACTIVE) {
                    session.total_active_seconds += dto.durationSeconds;
                } else {
                    session.total_idle_seconds += dto.durationSeconds;
                }

                // Update last activity timestamp
                session.last_activity_at = new Date();

                // Save session (optimistic locking will check version)
                const updatedSession = await manager.save(WorkSession, session);

                // Create activity log
                const activityLog = manager.create(ActivityLog, {
                    session_id: sessionId,
                    timestamp: new Date(),
                    activity_type: dto.activityType,
                    duration_seconds: dto.durationSeconds,
                    app_name: dto.appName || null,
                    url: dto.url || null,
                });

                const savedActivity = await manager.save(ActivityLog, activityLog);

                logger.info(
                    {
                        sessionId,
                        userId,
                        activityType: dto.activityType,
                        duration: dto.durationSeconds,
                    },
                    'Activity logged',
                );

                return { session: updatedSession, activity: savedActivity };
            });
        } catch (error) {
            if (error instanceof OptimisticLockVersionMismatchError && attempt < this.MAX_RETRIES) {
                logger.warn(
                    { sessionId, attempt },
                    'Optimistic lock conflict, retrying',
                );

                // Exponential backoff
                await this.delay(this.RETRY_DELAY_MS * Math.pow(2, attempt));
                return this.logActivityWithRetry(sessionId, userId, dto, attempt + 1);
            }

            if (attempt >= this.MAX_RETRIES) {
                logger.error({ sessionId, userId }, 'Max retries reached for activity logging');
                throw new ConflictException('Unable to log activity due to concurrent updates');
            }

            throw error;
        }
    }

    async batchLogActivity(userId: string, batchDto: BatchActivityDto) {
        const { sessionId, events } = batchDto;

        logger.info({ sessionId, eventCount: events.length }, 'Processing batch activity');

        return await this.dataSource.transaction(async (manager) => {
            const session = await manager.findOne(WorkSession, {
                where: { id: sessionId, user_id: userId },
            });

            if (!session) {
                throw new NotFoundException('Session not found');
            }

            if (session.status === SessionStatus.STOPPED) {
                throw new BadRequestException('Cannot log activity to a stopped session');
            }

            // Calculate totals from batch
            let totalActive = 0;
            let totalIdle = 0;

            for (const event of events) {
                if (event.activityType === ActivityType.ACTIVE) {
                    totalActive += event.durationSeconds;
                } else {
                    totalIdle += event.durationSeconds;
                }
            }

            // Update session
            session.total_active_seconds += totalActive;
            session.total_idle_seconds += totalIdle;
            session.last_activity_at = new Date();

            const updatedSession = await manager.save(WorkSession, session);

            // Insert activity logs
            const activityLogs = events.map((event) =>
                manager.create(ActivityLog, {
                    session_id: sessionId,
                    timestamp: new Date(event.timestamp),
                    activity_type: event.activityType,
                    duration_seconds: event.durationSeconds,
                    app_name: event.appName || null,
                    url: event.url || null,
                }),
            );

            await manager.save(ActivityLog, activityLogs);

            logger.info(
                { sessionId, eventCount: events.length, totalActive, totalIdle },
                'Batch activity logged',
            );

            return {
                session: updatedSession,
                processedCount: events.length,
            };
        });
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
