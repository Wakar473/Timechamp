import { IsUUID, IsOptional, IsString, IsEnum } from 'class-validator';
import { SessionStatus } from '../../../common/enums';

export class StartSessionDto {
    @IsOptional()
    @IsUUID()
    project_id?: string;
}

export class StopSessionDto {
    @IsOptional()
    @IsString()
    notes?: string;
}

export class SessionResponseDto {
    id: string;
    user_id: string;
    organization_id: string;
    project_id?: string;
    start_time: Date;
    end_time?: Date;
    total_active_seconds: number;
    total_idle_seconds: number;
    @IsEnum(SessionStatus)
    status: SessionStatus;
    last_activity_at: Date;
}
