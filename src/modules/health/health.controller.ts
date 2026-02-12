import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
    private redis: Redis;

    constructor(private readonly configService: ConfigService) {
        super();
        this.redis = new Redis({
            host: configService.get<string>('redis.host'),
            port: configService.get<number>('redis.port'),
        });
    }

    async isHealthy(key: string): Promise<HealthIndicatorResult> {
        try {
            await this.redis.ping();
            return this.getStatus(key, true);
        } catch (error) {
            throw new HealthCheckError('Redis check failed', this.getStatus(key, false));
        }
    }
}

@Controller('health')
export class HealthController {
    constructor(
        private readonly health: HealthCheckService,
        private readonly db: TypeOrmHealthIndicator,
        private readonly redisHealth: RedisHealthIndicator,
    ) { }

    @Get()
    @HealthCheck()
    check() {
        return this.health.check([
            () => this.db.pingCheck('database'),
            () => this.redisHealth.isHealthy('redis'),
        ]);
    }
}
