import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { DailySummary } from '../../entities/daily-summary.entity';
import { WorkSession } from '../../entities/work-session.entity';

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(DailySummary)
        private dailySummaryRepository: Repository<DailySummary>,
        @InjectRepository(WorkSession)
        private workSessionRepository: Repository<WorkSession>,
    ) { }

    /**
     * Get daily summary for a specific user and date
     */
    async getDailySummary(userId: string, date: string, organizationId: string) {
        const summary = await this.dailySummaryRepository.findOne({
            where: {
                user_id: userId,
                date: new Date(date),
                organization_id: organizationId,
            },
        });

        if (!summary) {
            // If no summary exists, calculate from sessions for that day
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            const sessions = await this.workSessionRepository.find({
                where: {
                    user_id: userId,
                    organization_id: organizationId,
                    start_time: Between(startOfDay, endOfDay),
                },
            });

            const totalActiveSeconds = sessions.reduce((sum, s) => sum + s.total_active_seconds, 0);
            const totalIdleSeconds = sessions.reduce((sum, s) => sum + s.total_idle_seconds, 0);
            const totalWorkSeconds = totalActiveSeconds + totalIdleSeconds;
            const productivityScore = totalWorkSeconds > 0
                ? Number(((totalActiveSeconds / totalWorkSeconds) * 100).toFixed(2))
                : 0;

            return {
                user_id: userId,
                date,
                total_work_seconds: totalWorkSeconds,
                active_seconds: totalActiveSeconds,
                idle_seconds: totalIdleSeconds,
                productivity_score: productivityScore,
                sessions_count: sessions.length,
            };
        }

        return {
            ...summary,
            sessions_count: await this.getSessionsCountForDate(userId, date, organizationId),
        };
    }

    /**
     * Get user productivity report over a date range
     */
    async getUserReport(
        userId: string,
        startDate: string,
        endDate: string,
        organizationId: string,
    ) {
        const summaries = await this.dailySummaryRepository.find({
            where: {
                user_id: userId,
                organization_id: organizationId,
                date: Between(new Date(startDate), new Date(endDate)),
            },
            order: { date: 'ASC' },
        });

        // Also get sessions for days without summaries
        const sessions = await this.workSessionRepository.find({
            where: {
                user_id: userId,
                organization_id: organizationId,
                start_time: Between(new Date(startDate), new Date(endDate)),
            },
        });

        const totalActiveSeconds = summaries.reduce((sum, s) => sum + s.active_seconds, 0)
            + sessions.reduce((sum, s) => sum + s.total_active_seconds, 0);
        const totalIdleSeconds = summaries.reduce((sum, s) => sum + s.idle_seconds, 0)
            + sessions.reduce((sum, s) => sum + s.total_idle_seconds, 0);
        const totalWorkSeconds = totalActiveSeconds + totalIdleSeconds;
        const avgProductivityScore = summaries.length > 0
            ? summaries.reduce((sum, s) => sum + s.productivity_score, 0) / summaries.length
            : 0;

        return {
            user_id: userId,
            start_date: startDate,
            end_date: endDate,
            total_work_seconds: totalWorkSeconds,
            total_active_seconds: totalActiveSeconds,
            total_idle_seconds: totalIdleSeconds,
            average_productivity_score: Number(avgProductivityScore.toFixed(2)),
            days_worked: summaries.length,
            daily_summaries: summaries,
        };
    }

    private async getSessionsCountForDate(
        userId: string,
        date: string,
        organizationId: string,
    ): Promise<number> {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        return this.workSessionRepository.count({
            where: {
                user_id: userId,
                organization_id: organizationId,
                start_time: Between(startOfDay, endOfDay),
            },
        });
    }
}
