import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Index } from 'typeorm';
import type { User } from './user.entity';
import type { Organization } from './organization.entity';
import type { WorkSession } from './work-session.entity';
import { AlertType } from '../common/enums';
export { AlertType };

@Entity('alerts')
@Index(['organization_id', 'created_at'])
@Index(['user_id', 'type'])
export class Alert {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    organization_id: string;

    @Column({ type: 'uuid' })
    user_id: string;

    @Column({ type: 'uuid', nullable: true })
    session_id: string;

    @Column({ type: 'enum', enum: AlertType })
    type: AlertType;

    @Column({ type: 'text' })
    message: string;

    @CreateDateColumn()
    created_at: Date;

    @Column({ type: 'timestamp', nullable: true })
    resolved_at: Date;

    @Column({ type: 'uuid', nullable: true })
    resolved_by: string;

    @ManyToOne('Organization')
    organization: Organization;

    @ManyToOne('User', 'alerts')
    user: User;

    @ManyToOne('WorkSession')
    session: WorkSession;

    @ManyToOne('User')
    resolver: User;
}
