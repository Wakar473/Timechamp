import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DailySummaryProcessor } from './processors/daily-summary.processor';
import { IdleDetectorProcessor } from './processors/idle-detector.processor';
import { OvertimeCheckerProcessor } from './processors/overtime-checker.processor';
import { WorkSession } from '../../entities/work-session.entity';
import { DailySummary } from '../../entities/daily-summary.entity';
import { Alert } from '../../entities/alert.entity';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([WorkSession, DailySummary, Alert]),
        BullModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                redis: {
                    host: configService.get<string>('redis.host'),
                    port: configService.get<number>('redis.port'),
                },
            }),
        }),
        BullModule.registerQueue(
            { name: 'daily-summary' },
            { name: 'idle-detector' },
            { name: 'overtime-checker' },
        ),
        WebsocketModule,
    ],
    providers: [DailySummaryProcessor, IdleDetectorProcessor, OvertimeCheckerProcessor],
    exports: [BullModule],
})
export class JobsModule { }
