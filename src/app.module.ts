import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import jwtConfig from './config/jwt.config';
import { AuthModule } from './modules/auth/auth.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { ActivityModule } from './modules/activity/activity.module';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { HealthModule } from './modules/health/health.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [databaseConfig, redisConfig, jwtConfig],
        }),
        TypeOrmModule.forRootAsync({
            useFactory: () => ({
                type: 'postgres',
                host: process.env.DATABASE_HOST || 'localhost',
                port: Number(process.env.DATABASE_PORT) || 5432,
                username: process.env.DATABASE_USER || 'workpulse',
                password: process.env.DATABASE_PASSWORD || 'changeme',
                database: process.env.DATABASE_NAME || 'workpulse_db',
                entities: [__dirname + '/entities/*.entity{.ts,.js}'],
                synchronize: false,
                logging: process.env.NODE_ENV === 'development',
            }),
        }),
        AuthModule,
        SessionsModule,
        ActivityModule,
        WebsocketModule,
        JobsModule,
        HealthModule,
    ],
})
export class AppModule { }
