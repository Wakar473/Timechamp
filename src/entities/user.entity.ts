import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, Index } from 'typeorm';
import type { Organization } from './organization.entity';
import type { WorkSession } from './work-session.entity';
import type { DailySummary } from './daily-summary.entity';
import type { Alert } from './alert.entity';
import { UserRole, UserStatus } from '../common/enums';
export { UserRole, UserStatus };

@Entity('users')
@Index(['organization_id', 'email'], { unique: true })
@Index(['organization_id', 'employee_id'], { unique: true })
@Index(['manager_id'])
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    organization_id: string;

    @Column({ type: 'varchar', length: 255 })
    email: string;

    @Column({ type: 'varchar', length: 255 })
    password_hash: string;

    @Column({ type: 'varchar', length: 100 })
    first_name: string;

    @Column({ type: 'varchar', length: 100 })
    last_name: string;

    @Column({ type: 'varchar', length: 50 })
    employee_id: string;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.EMPLOYEE })
    role: UserRole;

    @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
    status: UserStatus;

    @Column({ type: 'uuid', nullable: true })
    manager_id: string;

    @Column({ type: 'timestamp', nullable: true })
    last_seen: Date;

    @CreateDateColumn()
    created_at: Date;

    @ManyToOne('Organization', 'users')
    organization: Organization;

    @ManyToOne('User', 'team_members', { nullable: true })
    manager: User;

    @OneToMany('User', 'manager')
    team_members: User[];

    @OneToMany('WorkSession', 'user')
    work_sessions: WorkSession[];

    @OneToMany('DailySummary', 'user')
    daily_summaries: DailySummary[];

    @OneToMany('Alert', 'user')
    alerts: Alert[];
}
