import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, Index } from 'typeorm';
import { Organization } from './organization.entity';
import { WorkSession } from './work-session.entity';
import { DailySummary } from './daily-summary.entity';
import { Alert } from './alert.entity';
import { UserRole, UserStatus } from '../common/enums';
export { UserRole, UserStatus };

@Entity('users')
@Index(['organization_id', 'email'], { unique: true })
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    organization_id: string;

    @Column({ type: 'varchar', length: 255 })
    email: string;

    @Column({ type: 'varchar', length: 255 })
    password_hash: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.EMPLOYEE })
    role: UserRole;

    @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
    status: UserStatus;

    @Column({ type: 'timestamp', nullable: true })
    last_seen: Date;

    @CreateDateColumn()
    created_at: Date;

    @ManyToOne('Organization', 'users')
    organization: Organization;

    @OneToMany('WorkSession', 'user')
    work_sessions: WorkSession[];

    @OneToMany('DailySummary', 'user')
    daily_summaries: DailySummary[];

    @OneToMany('Alert', 'user')
    alerts: Alert[];
}
