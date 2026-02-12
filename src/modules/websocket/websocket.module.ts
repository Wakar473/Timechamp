import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventsGateway } from './events.gateway';
import { WorkSession } from '../../entities/work-session.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([WorkSession]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('jwt.secret'),
            }),
        }),
    ],
    providers: [EventsGateway],
    exports: [EventsGateway],
})
export class WebsocketModule { }
