import puppeteer, { Browser } from 'puppeteer';

let browser: Browser | null = null;
let pdfCount = 0;
const MAX_PDFS_BEFORE_RESTART = 50;

async function getBrowser(): Promise<Browser> {
    if (!browser || !browser.isConnected() || pdfCount >= MAX_PDFS_BEFORE_RESTART) {
        if (browser) await browser.close().catch(() => { });
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        });
        pdfCount = 0;
    }
    return browser;
}

export class PdfService {
    async generatePdf(html: string): Promise<Buffer> {
        const browserInstance = await getBrowser();
        const page = await browserInstance.newPage();

        try {
            await page.setContent(html, { waitUntil: 'networkidle0' });

            const uint8ArrayPdf = await page.pdf({
                format: 'A4',
                margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' },
                printBackground: true,
            });

            pdfCount++;
            return Buffer.from(uint8ArrayPdf);
        } finally {
            await page.close();
        }
    }
}

export const pdfService = new PdfService();

// Cleanup on process exit
process.on('exit', () => { browser?.close().catch(() => { }); });
process.on('SIGINT', () => { browser?.close().catch(() => { }); process.exit(); });
