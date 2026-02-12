import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { StartSessionDto } from './dto/session.dto';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
    constructor(private readonly sessionsService: SessionsService) { }

    @Post('start')
    async startSession(@CurrentUser() user: any, @Body() dto: StartSessionDto) {
        return this.sessionsService.startSession(user.id, user.organization_id, dto);
    }

    @Post(':id/stop')
    async stopSession(@Param('id') sessionId: string, @CurrentUser() user: any) {
        return this.sessionsService.stopSession(sessionId, user.id);
    }

    @Get('active')
    async getActiveSessions(@CurrentUser() user: any) {
        return this.sessionsService.getActiveSessions(user.organization_id);
    }
}
