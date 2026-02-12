import { Process, Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Job } from 'bull';
import { WorkSession } from '../../../entities/work-session.entity';
import { DailySummary } from '../../../entities/daily-summary.entity';
import logger from '../../../config/logger.config';

@Injectable()
@Processor('daily-summary')
export class DailySummaryProcessor {
    constructor(
        @InjectRepository(WorkSession)
        private readonly sessionRepository: Repository<WorkSession>,
        @InjectRepository(DailySummary)
        private readonly dailySummaryRepository: Repository<DailySummary>,
    ) {

    }

    @Process()
    async process(job: Job) {
        const { date, organizationId } = job.data;

        logger.info({ date, organizationId }, 'Processing daily summary');

        // Get all sessions for the date
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const sessions = await this.sessionRepository.find({
            where: {
                organization_id: organizationId,
                start_time: Between(startOfDay, endOfDay),
            },
        });

        // Group by user
        const userSessions = new Map<string, WorkSession[]>();

        for (const session of sessions) {
            if (!userSessions.has(session.user_id)) {
                userSessions.set(session.user_id, []);
            }
            userSessions.get(session.user_id).push(session);
        }

        // Create/update summaries for each user
        for (const [userId, userSessionList] of userSessions) {
            const totalActive = userSessionList.reduce((sum, s) => sum + s.total_active_seconds, 0);
            const totalIdle = userSessionList.reduce((sum, s) => sum + s.total_idle_seconds, 0);
            const totalWork = totalActive + totalIdle;
            const productivityScore = totalWork > 0 ? (totalActive / totalWork) * 100 : 0;

            // Upsert daily summary (idempotent)
            await this.dailySummaryRepository.upsert(
                {
                    user_id: userId,
                    organization_id: organizationId,
                    date: startOfDay,
                    total_work_seconds: totalWork,
                    active_seconds: totalActive,
                    idle_seconds: totalIdle,
                    productivity_score: Number(productivityScore.toFixed(2)),
                },
                ['user_id', 'date'],
            );

            logger.info({ userId, date, totalActive, totalIdle }, 'Daily summary created');
        }

        return { processedUsers: userSessions.size };
    }
}
