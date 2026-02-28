import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { config } from '../config/env';
import { logger } from './logger';

const HOURS_24_MS = 24 * 60 * 60 * 1000;

/**
 * Sweeps the uploads directory for files older than 24 hours and deletes them.
 */
export function initializeCleanupJob() {
    // Run every hour at minute 0
    cron.schedule('0 * * * *', async () => {
        logger.info('Starting hourly cron job: Cleaning up orphaned PDF files...');

        try {
            const uploadDir = config.uploadDir;

            if (!fs.existsSync(uploadDir)) {
                logger.debug(`Upload directory ${uploadDir} does not exist, skipping cleanup.`);
                return;
            }

            const files = fs.readdirSync(uploadDir);
            const now = Date.now();
            let deletedCount = 0;

            for (const file of files) {
                // Skip hidden files or structural dotfiles
                if (file.startsWith('.')) continue;

                const filePath = path.join(uploadDir, file);
                const stats = fs.statSync(filePath);

                // If file is older than 24 hours, delete it
                if (now - stats.mtimeMs > HOURS_24_MS) {
                    try {
                        fs.unlinkSync(filePath);
                        deletedCount++;
                        logger.debug({ deletedFile: file }, 'Deleted old uploaded file');
                    } catch (err) {
                        logger.error({ err, filePath }, 'Failed to delete orphaned file');
                    }
                }
            }

            logger.info({ deletedCount }, 'Hourly cleanup job completed successfully');
        } catch (error) {
            logger.error({ err: error }, 'Critical error running cleanup cron job');
        }
    });

    logger.info('Hourly cleanup cron job initialized (0 * * * *)');
}
