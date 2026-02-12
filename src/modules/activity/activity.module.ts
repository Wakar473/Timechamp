import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { WorkSession } from '../../entities/work-session.entity';
import { ActivityLog } from '../../entities/activity-log.entity';

@Module({
    imports: [TypeOrmModule.forFeature([WorkSession, ActivityLog])],
    controllers: [ActivityController],
    providers: [ActivityService],
    exports: [ActivityService],
})
export class ActivityModule { }
