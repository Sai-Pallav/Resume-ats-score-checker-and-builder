"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const prisma_1 = __importDefault(require("./utils/prisma"));
const pdf_service_1 = require("./services/pdf/pdf.service");
const logger_1 = require("./utils/logger");
const server = app_1.default.listen(env_1.config.port, () => {
    logger_1.logger.info(`[resume-module] Server running on port ${env_1.config.port}`);
    logger_1.logger.info(`[resume-module] Environment: ${env_1.config.nodeEnv}`);
    // Start background maintenance tasks
    (0, pdf_service_1.startPuppeteerWatchdog)();
});
/**
 * Handle Graceful Shutdown
 * Ensures all active Express requests finish, Database connections safely snap off,
 * and background headless Chromium instances are nuked cleanly to prevent RAM leaks.
 */
const gracefulShutdown = async (signal) => {
    logger_1.logger.info(`Received ${signal}. Shutting down gracefully...`);
    // 1. Stop accepting new requests & finish active ones
    server.close(async () => {
        logger_1.logger.info('HTTP server closed.');
        try {
            // 2. Shut down Prisma Database Connection Pool
            await prisma_1.default.$disconnect();
            logger_1.logger.info('PostgreSQL database connection closed.');
            // 3. Shut down Puppeteer Chromium Engine
            await (0, pdf_service_1.cleanupPuppeteer)();
            logger_1.logger.info('Graceful shutdown completed. Exiting process.');
            process.exit(0);
        }
        catch (error) {
            logger_1.logger.error({ err: error }, 'Error during graceful shutdown');
            process.exit(1);
        }
    });
    // If server hasn't finished in 10s, force quit
    setTimeout(() => {
        logger_1.logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};
// Bind OS exit signals to the teardown pipeline
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
//# sourceMappingURL=index.js.map