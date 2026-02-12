import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { DailySummary } from '../../entities/daily-summary.entity';
import { WorkSession } from '../../entities/work-session.entity';

@Module({
    imports: [TypeOrmModule.forFeature([DailySummary, WorkSession])],
    controllers: [ReportsController],
    providers: [ReportsService],
})
export class ReportsModule { }
