import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import logger from './config/logger.config';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: false, // We use Pino instead
    });

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    // Global exception filter
    app.useGlobalFilters(new GlobalExceptionFilter());

    // Enable CORS
    app.enableCors();

    const port = process.env.PORT || 3000;

    // Graceful shutdown
    app.enableShutdownHooks();

    process.on('SIGTERM', async () => {
        logger.info('SIGTERM signal received, closing application');
        await app.close();
        process.exit(0);
    });

    process.on('SIGINT', async () => {
        logger.info('SIGINT signal received, closing application');
        await app.close();
        process.exit(0);
    });

    await app.listen(port);

    logger.info({ port }, 'WorkPulse API server started');
}

bootstrap();
