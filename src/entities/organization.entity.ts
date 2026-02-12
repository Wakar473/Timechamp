import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Project } from './project.entity';
import { WorkSession } from './work-session.entity';
import { DailySummary } from './daily-summary.entity';

@Entity('organizations')
export class Organization {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 50 })
    plan_type: string;

    @CreateDateColumn()
    created_at: Date;

    @OneToMany('User', 'organization')
    users: User[];

    @OneToMany('Project', 'organization')
    projects: Project[];

    @OneToMany('WorkSession', 'organization')
    work_sessions: WorkSession[];

    @OneToMany('DailySummary', 'organization')
    daily_summaries: DailySummary[];
}
