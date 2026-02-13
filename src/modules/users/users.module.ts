import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ProjectsModule } from '../projects/projects.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        forwardRef(() => ProjectsModule),
    ],
    controllers: [UsersController],
    providers: [UsersService],
})
export class UsersModule { }
