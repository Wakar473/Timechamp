import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Index } from 'typeorm';
import type { Organization } from './organization.entity';
import type { User } from './user.entity';

@Entity('daily_summaries')
@Index(['user_id', 'date'], { unique: true })
export class DailySummary {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    organization_id: string;

    @Column({ type: 'uuid' })
    user_id: string;

    @Column({ type: 'date' })
    date: Date;

    @Column({ type: 'int', default: 0 })
    total_work_seconds: number;

    @Column({ type: 'int', default: 0 })
    active_seconds: number;

    @Column({ type: 'int', default: 0 })
    idle_seconds: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
    productivity_score: number;

    @CreateDateColumn()
    created_at: Date;

    @ManyToOne('Organization', 'daily_summaries')
    organization: Organization;

    @ManyToOne('User', 'daily_summaries')
    user: User;
}
