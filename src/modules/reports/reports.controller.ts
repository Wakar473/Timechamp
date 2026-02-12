import {
    Controller,
    Get,
    Query,
    Param,
    UseGuards,
    BadRequestException,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('daily')
    async getDailySummary(
        @Query('date') date: string,
        @Query('userId') userId: string,
        @CurrentUser() user: any,
    ) {
        if (!date) {
            throw new BadRequestException('Date parameter is required (format: YYYY-MM-DD)');
        }

        // Validate date format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
        }

        // If userId is provided, use it (for managers), otherwise use current user
        const targetUserId = userId || user.userId;

        return this.reportsService.getDailySummary(
            targetUserId,
            date,
            user.organizationId,
        );
    }

    @Get('user/:id')
    async getUserReport(
        @Param('id') userId: string,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @CurrentUser() user: any,
    ) {
        if (!startDate || !endDate) {
            throw new BadRequestException('startDate and endDate parameters are required');
        }

        // Validate date format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
            throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
        }

        // Validate date range
        if (new Date(startDate) > new Date(endDate)) {
            throw new BadRequestException('startDate must be before or equal to endDate');
        }

        return this.reportsService.getUserReport(
            userId,
            startDate,
            endDate,
            user.organizationId,
        );
    }
}
