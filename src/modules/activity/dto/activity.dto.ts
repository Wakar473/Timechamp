import { IsEnum, IsInt, IsOptional, IsString, Min, IsArray, ValidateNested, IsISO8601, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ActivityType } from '../../../common/enums';

export class LogActivityDto {
    @IsEnum(ActivityType)
    activityType: ActivityType;

    @IsInt()
    @Min(0)
    durationSeconds: number;

    @IsOptional()
    @IsString()
    appName?: string;

    @IsOptional()
    @IsString()
    url?: string;

    @IsOptional()
    @IsDateString()
    screenshot_timestamp?: string;
}

export class ActivityEventDto {
    @IsISO8601()
    timestamp: string;

    @IsEnum(ActivityType)
    activityType: ActivityType;

    @IsInt()
    @Min(0)
    durationSeconds: number;

    @IsOptional()
    @IsString()
    appName?: string;

    @IsOptional()
    @IsString()
    url?: string;

    @IsOptional()
    @IsDateString()
    screenshot_timestamp?: string;
}

export class BatchActivityDto {
    @IsString()
    sessionId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ActivityEventDto)
    events: ActivityEventDto[];
}
