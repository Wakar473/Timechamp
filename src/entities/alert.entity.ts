import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { AlertType } from '../common/enums';
export { AlertType };

@Entity('alerts')
export class Alert {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    user_id: string;

    @Column({ type: 'enum', enum: AlertType })
    type: AlertType;

    @Column({ type: 'text' })
    message: string;

    @CreateDateColumn()
    created_at: Date;

    @Column({ type: 'timestamp', nullable: true })
    resolved_at: Date;

    @ManyToOne('User', 'alerts')
    user: User;
}
