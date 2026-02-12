import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { LogActivityDto, BatchActivityDto } from './dto/activity.dto';
import { Throttle } from '@nestjs/throttler';

@Controller()
@UseGuards(JwtAuthGuard)
export class ActivityController {
    constructor(private readonly activityService: ActivityService) { }

    @Post('sessions/:id/activity')
    @Throttle({ default: { limit: 1, ttl: 10000 } }) // Max 1 activity update per 10 seconds
    async logActivity(
        @Param('id') sessionId: string,
        @CurrentUser() user: any,
        @Body() dto: LogActivityDto,
    ) {
        return this.activityService.logActivity(sessionId, user.id, dto);
    }

    @Post('activity/batch')
    async batchLogActivity(@CurrentUser() user: any, @Body() dto: BatchActivityDto) {
        return this.activityService.batchLogActivity(user.id, dto);
    }
}
