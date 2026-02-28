import puppeteer, { Browser } from 'puppeteer';
import { logger } from '../../utils/logger';
import path from 'path';
import fs from 'fs';
import cron from 'node-cron';

const pdfLogger = logger.child({ category: 'PDF' });

let browser: Browser | null = null;
let pdfCount = 0;
const MAX_PDFS_BEFORE_RESTART = 50;

export const checkPuppeteerHealth = async (): Promise<boolean> => {
    try {
        const b = await getBrowser();
        return b.isConnected();
    } catch (error) {
        pdfLogger.error({ err: error }, 'Puppeteer health check failed');
        return false;
    }
};

async function getBrowser(): Promise<Browser> {
    if (!browser || !browser.isConnected() || pdfCount >= MAX_PDFS_BEFORE_RESTART) {
        if (browser) await browser.close().catch(() => { });
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        });

        // Listen for unexpected crashes/disconnects to force a new instance next time
        browser.on('disconnected', () => {
            if (browser) {
                pdfLogger.warn('Puppeteer browser disconnected unexpectedly. Will restart on next request.');
                browser = null;
            }
        });

        pdfCount = 0;
    }
    return browser;
}

export class PdfService {
    private getCachePath(hash: string): string {
        return path.join(process.cwd(), 'uploads', 'pdfs', `${hash}.pdf`);
    }

    async getCachedPdf(hash: string): Promise<Buffer | null> {
        const cachePath = this.getCachePath(hash);
        if (fs.existsSync(cachePath)) {
            const stats = fs.statSync(cachePath);
            const now = new Date().getTime();
            const age = now - stats.mtime.getTime();
            const MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

            if (age < MAX_AGE) {
                pdfLogger.info({ hash }, 'PDF Cache Hit');
                return fs.readFileSync(cachePath);
            } else {
                pdfLogger.info({ hash }, 'PDF Cache Expired');
                fs.unlinkSync(cachePath);
            }
        }
        return null;
    }

    async cachePdf(hash: string, buffer: Buffer): Promise<void> {
        const cachePath = this.getCachePath(hash);
        const dir = path.dirname(cachePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(cachePath, buffer);
        pdfLogger.info({ hash }, 'PDF Cached');
    }

    async generatePdf(html: string, retries = 1): Promise<Buffer> {
        let browserInstance: Browser | null = null;
        let page = null;

        try {
            browserInstance = await getBrowser();
            page = await browserInstance.newPage();

            await page.setContent(html, { waitUntil: 'networkidle0' });

            const uint8ArrayPdf = await page.pdf({
                format: 'A4',
                margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' },
                printBackground: true,
            });

            pdfCount++;
            return Buffer.from(uint8ArrayPdf);
        } catch (error) {
            pdfLogger.error({ err: error, retriesLeft: retries }, 'PDF Generation Error');

            // Force close broken browser
            if (browserInstance) {
                await browserInstance.close().catch(() => { });
                browser = null; // Trigger getBrowser() to mint a new one
            }

            if (retries > 0) {
                pdfLogger.info('Retrying PDF generation...');
                return this.generatePdf(html, retries - 1);
            }

            throw new Error(`Failed to generate PDF after retries: ${(error as Error).message}`);
        } finally {
            if (page) {
                await page.close().catch(() => { });
            }
        }
    }

    async generateScreenshot(html: string, retries = 1): Promise<Buffer> {
        let browserInstance: Browser | null = null;
        let page = null;

        try {
            browserInstance = await getBrowser();
            page = await browserInstance.newPage();

            // Setup viewport for a standard A4-like aspect ratio portrait
            await page.setViewport({ width: 800, height: 1131, deviceScaleFactor: 2 });
            await page.setContent(html, { waitUntil: 'networkidle0' });

            const uint8ArrayPng = await page.screenshot({
                type: 'png',
                fullPage: true,
                captureBeyondViewport: false
            });

            pdfCount++; // Treat as equivalent load metric
            return Buffer.from(uint8ArrayPng);
        } catch (error) {
            pdfLogger.error({ err: error, retriesLeft: retries }, 'Screenshot Generation Error');

            if (browserInstance) {
                await browserInstance.close().catch(() => { });
                browser = null;
            }

            if (retries > 0) {
                pdfLogger.info('Retrying Screenshot generation...');
                return this.generateScreenshot(html, retries - 1);
            }

            throw new Error(`Failed to generate Screenshot after retries: ${(error as Error).message}`);
        } finally {
            if (page) {
                await page.close().catch(() => { });
            }
        }
    }
}

export const pdfService = new PdfService();

// Export cleanup explicitly for global index.ts graceful shutdown orchestration
export const cleanupPuppeteer = async () => {
    if (browser) {
        pdfLogger.info('Shutting down background Chromium sandbox...');
        await browser.close().catch(() => { });
        browser = null;
    }
};

/**
 * Watchdog to prevent Puppeteer memory leaks and orphan pages.
 * Runs every 10 minutes.
 */
export const startPuppeteerWatchdog = () => {
    cron.schedule('*/10 * * * *', async () => {
        pdfLogger.info('Running Puppeteer health watchdog...');

        try {
            if (!browser || !browser.isConnected()) {
                return;
            }

            // 1. Close orphan pages
            const pages = await browser.pages();
            if (pages.length > 1) {
                pdfLogger.info({ openPages: pages.length }, 'Cleaning up orphan Puppeteer pages');
                // Keep the first page (usually blank) but close others
                for (let i = 1; i < pages.length; i++) {
                    await pages[i].close().catch(() => { });
                }
            }

            // 2. Check Memory Usage (RSS)
            const memoryUsage = process.memoryUsage();
            const rssMb = Math.round(memoryUsage.rss / 1024 / 1024);
            const MEMORY_THRESHOLD_MB = 500;

            pdfLogger.info({ rssMb, pdfCount }, 'Puppeteer resource status');

            if (rssMb > MEMORY_THRESHOLD_MB) {
                pdfLogger.warn({ rssMb, threshold: MEMORY_THRESHOLD_MB }, 'Memory threshold exceeded, restarting Puppeteer browser');
                await cleanupPuppeteer();
                // Next request will trigger getBrowser() and mint a fresh one
            }
        } catch (error) {
            pdfLogger.error({ err: error }, 'Puppeteer watchdog encountered an error');
        }
    });

    pdfLogger.info('Puppeteer cleanup watchdog started (10m interval)');
};
