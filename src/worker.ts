import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import logger from './config/logger.config';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule, {
        logger: false,
    });

    logger.info('WorkPulse background worker started');

    // Graceful shutdown
    process.on('SIGTERM', async () => {
        logger.info('SIGTERM signal received, closing worker');
        await app.close();
        process.exit(0);
    });

    process.on('SIGINT', async () => {
        logger.info('SIGINT signal received, closing worker');
        await app.close();
        process.exit(0);
    });
}

bootstrap();
