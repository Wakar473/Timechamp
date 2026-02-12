import { Process, Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Job } from 'bull';
import { DailySummary } from '../../../entities/daily-summary.entity';
import { Alert, AlertType } from '../../../entities/alert.entity';
import { EventsGateway } from '../../websocket/events.gateway';
import logger from '../../../config/logger.config';

@Injectable()
@Processor('overtime-checker')
export class OvertimeCheckerProcessor {
    private readonly OVERTIME_THRESHOLD_HOURS = 9;

    constructor(
        @InjectRepository(DailySummary)
        private readonly dailySummaryRepository: Repository<DailySummary>,
        @InjectRepository(Alert)
        private readonly alertRepository: Repository<Alert>,
        private readonly eventsGateway: EventsGateway,
    ) {

    }

    @Process()
    async process(job: Job) {
        logger.info('Processing overtime check');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const overtimeThresholdSeconds = this.OVERTIME_THRESHOLD_HOURS * 3600;

        // Find users who worked more than threshold
        const overtimeSummaries = await this.dailySummaryRepository
            .createQueryBuilder('summary')
            .where('summary.date = :today', { today })
            .andWhere('summary.total_work_seconds > :threshold', {
                threshold: overtimeThresholdSeconds,
            })
            .getMany();

        let alertsCreated = 0;

        for (const summary of overtimeSummaries) {
            // Check if alert already sent for today
            const existingAlert = await this.alertRepository.findOne({
                where: {
                    user_id: summary.user_id,
                    type: AlertType.OVERTIME,
                    created_at: MoreThanOrEqual(today),
                },
            });

            if (!existingAlert) {
                const hoursWorked = (summary.total_work_seconds / 3600).toFixed(1);

                const alert = this.alertRepository.create({
                    user_id: summary.user_id,
                    type: AlertType.OVERTIME,
                    message: `You have worked ${hoursWorked} hours today, exceeding the ${this.OVERTIME_THRESHOLD_HOURS} hour threshold`,
                });

                await this.alertRepository.save(alert);

                // Emit WebSocket event
                this.eventsGateway.emitToUser(summary.user_id, 'OVERTIME_ALERT', {
                    hoursWorked: parseFloat(hoursWorked),
                    message: alert.message,
                    timestamp: new Date(),
                });

                alertsCreated++;

                logger.info({ userId: summary.user_id, hoursWorked }, 'Overtime alert created');
            }
        }

        return { overtimeUsersFound: overtimeSummaries.length, alertsCreated };
    }
}
