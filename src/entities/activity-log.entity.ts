import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
import { WorkSession } from './work-session.entity';
import { ActivityType } from '../common/enums';
export { ActivityType };

@Entity('activity_logs')
@Index(['session_id', 'timestamp'])
export class ActivityLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    session_id: string;

    @Column({ type: 'timestamp' })
    timestamp: Date;

    @Column({ type: 'enum', enum: ActivityType })
    activity_type: ActivityType;

    @Column({ type: 'int' })
    duration_seconds: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    app_name: string;

    @Column({ type: 'text', nullable: true })
    url: string;

    @ManyToOne('WorkSession', 'activity_logs')
    session: WorkSession;
}
