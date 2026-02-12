import { Process, Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Job } from 'bull';
import { WorkSession, SessionStatus } from '../../../entities/work-session.entity';
import { Alert, AlertType } from '../../../entities/alert.entity';
import { EventsGateway } from '../../websocket/events.gateway';
import logger from '../../../config/logger.config';

@Injectable()
@Processor('idle-detector')
export class IdleDetectorProcessor {
    private readonly IDLE_THRESHOLD_MINUTES = 5;

    constructor(
        @InjectRepository(WorkSession)
        private readonly sessionRepository: Repository<WorkSession>,
        @InjectRepository(Alert)
        private readonly alertRepository: Repository<Alert>,
        private readonly eventsGateway: EventsGateway,
    ) {

    }

    @Process()
    async process(job: Job) {
        logger.info('Processing idle detection');

        const thresholdTime = new Date();
        thresholdTime.setMinutes(thresholdTime.getMinutes() - this.IDLE_THRESHOLD_MINUTES);

        // Find active sessions with no activity for > 5 minutes
        const idleSessions = await this.sessionRepository.find({
            where: {
                status: SessionStatus.ACTIVE,
                last_activity_at: LessThan(thresholdTime),
            },
        });

        let alertsCreated = 0;

        for (const session of idleSessions) {
            // Check if alert already exists today for this session
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const existingAlert = await this.alertRepository.findOne({
                where: {
                    user_id: session.user_id,
                    type: AlertType.IDLE,
                    created_at: LessThan(new Date(today.getTime() + 86400000)), // Within today
                },
            });

            if (!existingAlert) {
                // Create alert
                const alert = this.alertRepository.create({
                    user_id: session.user_id,
                    type: AlertType.IDLE,
                    message: `No activity detected for ${this.IDLE_THRESHOLD_MINUTES} minutes`,
                });

                await this.alertRepository.save(alert);

                // Emit WebSocket event
                this.eventsGateway.emitToUser(session.user_id, 'INACTIVE_ALERT', {
                    sessionId: session.id,
                    message: alert.message,
                    timestamp: new Date(),
                });

                alertsCreated++;

                logger.info({ userId: session.user_id, sessionId: session.id }, 'Idle alert created');
            }
        }

        return { idleSessionsFound: idleSessions.length, alertsCreated };
    }
}
