import app from './app';
import { config } from './config/env';
import prisma from './utils/prisma';
import { cleanupPuppeteer, startPuppeteerWatchdog } from './services/pdf/pdf.service';
import { logger } from './utils/logger';

const server = app.listen(config.port, () => {
    logger.info(`[resume-module] Server running on port ${config.port}`);
    logger.info(`[resume-module] Environment: ${config.nodeEnv}`);

    // Start background maintenance tasks
    startPuppeteerWatchdog();
});

/**
 * Handle Graceful Shutdown
 * Ensures all active Express requests finish, Database connections safely snap off,
 * and background headless Chromium instances are nuked cleanly to prevent RAM leaks.
 */
const gracefulShutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);

    // 1. Stop accepting new requests & finish active ones
    server.close(async () => {
        logger.info('HTTP server closed.');

        try {
            // 2. Shut down Prisma Database Connection Pool
            await prisma.$disconnect();
            logger.info('PostgreSQL database connection closed.');

            // 3. Shut down Puppeteer Chromium Engine
            await cleanupPuppeteer();

            logger.info('Graceful shutdown completed. Exiting process.');
            process.exit(0);
        } catch (error) {
            logger.error({ err: error }, 'Error during graceful shutdown');
            process.exit(1);
        }
    });

    // If server hasn't finished in 10s, force quit
    setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};

// Bind OS exit signals to the teardown pipeline
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
