import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import type { Organization } from './organization.entity';
import type { User } from './user.entity';
import type { ProjectAssignment } from './project-assignment.entity';
import { ProjectType } from '../common/enums';
export { ProjectType };

@Entity('projects')
export class Project {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    organization_id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'uuid' })
    created_by: string;

    @Column({ type: 'enum', enum: ProjectType, default: ProjectType.NORMAL })
    project_type: ProjectType;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @Column({ type: 'timestamp', nullable: true })
    archived_at: Date;

    @CreateDateColumn()
    created_at: Date;

    @ManyToOne('Organization', 'projects')
    organization: Organization;

    @ManyToOne('User')
    creator: User;

    @OneToMany('ProjectAssignment', 'project')
    project_assignments: ProjectAssignment[];
}
