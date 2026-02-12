import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import type { Organization } from './organization.entity';
import type { User } from './user.entity';

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

    @CreateDateColumn()
    created_at: Date;

    @ManyToOne('Organization', 'projects')
    organization: Organization;

    @ManyToOne('User')
    creator: User;
}
