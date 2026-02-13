import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Index } from 'typeorm';
import type { User } from './user.entity';
import type { Project } from './project.entity';

@Entity('project_assignments')
@Index(['user_id', 'project_id'], { unique: true })
@Index(['project_id'])
export class ProjectAssignment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    user_id: string;

    @Column({ type: 'uuid' })
    project_id: string;

    @Column({ type: 'uuid' })
    assigned_by: string;

    @CreateDateColumn()
    assigned_at: Date;

    @ManyToOne('User')
    user: User;

    @ManyToOne('Project', 'project_assignments')
    project: Project;

    @ManyToOne('User')
    assigner: User;
}
