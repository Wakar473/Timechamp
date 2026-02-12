import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, Index, VersionColumn } from 'typeorm';
import type { Organization } from './organization.entity';
import type { User } from './user.entity';
import type { Project } from './project.entity';
import type { ActivityLog } from './activity-log.entity';
import { SessionStatus } from '../common/enums';
export { SessionStatus };

@Entity('work_sessions')
@Index(['user_id', 'status'])
@Index(['organization_id', 'start_time'])
export class WorkSession {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    organization_id: string;

    @Column({ type: 'uuid' })
    user_id: string;

    @Column({ type: 'uuid', nullable: true })
    project_id: string;

    @Column({ type: 'timestamp' })
    start_time: Date;

    @Column({ type: 'timestamp', nullable: true })
    end_time: Date;

    @Column({ type: 'int', default: 0 })
    total_active_seconds: number;

    @Column({ type: 'int', default: 0 })
    total_idle_seconds: number;

    @Column({ type: 'enum', enum: SessionStatus, default: SessionStatus.ACTIVE })
    status: SessionStatus;

    @Column({ type: 'timestamp', nullable: true })
    last_activity_at: Date;

    @VersionColumn()
    version: number;

    @CreateDateColumn()
    created_at: Date;

    @ManyToOne('Organization', 'work_sessions')
    organization: Organization;

    @ManyToOne('User', 'work_sessions')
    user: User;

    @ManyToOne('Project')
    project: Project;

    @OneToMany('ActivityLog', 'session')
    activity_logs: ActivityLog[];
}
