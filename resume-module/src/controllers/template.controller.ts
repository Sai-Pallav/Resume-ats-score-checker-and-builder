import { Request, Response, NextFunction } from 'express';
import { templateService } from '../services/template.service';
import { pdfService } from '../services/pdf/pdf.service';
import { sendSuccess } from '../utils/response';
import { NotFoundError } from '../utils/errors';
import path from 'path';
import fs from 'fs';

// Standard mock resume data to consistently paint a realistic template preview
const SAMPLE_RESUME_DATA = {
    title: 'Senior Software Engineer',
    summary: 'Experienced Software Engineer with a passion for building scalable web applications. Proven track record in TypeScript, Node.js, and React architecture.',
    contactInfo: {
        fullName: 'Jane Doe',
        email: 'jane.doe@example.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
        linkedin: 'linkedin.com/in/janedoe',
        website: 'janedoe.dev'
    },
    sections: [
        {
            type: 'Experience',
            data: [
                {
                    title: 'Senior Backend Engineer',
                    company: 'Tech Innovators Inc.',
                    duration: '2021 - Present',
                    description: [
                        'Architected and deployed a microservices platform handling 50k requests/min',
                        'Optimized database indexing improving average query time by 40%',
                        'Mentored a team of 4 junior developers'
                    ]
                },
                {
                    title: 'Software Developer',
                    company: 'Creative Solutions',
                    duration: '2018 - 2021',
                    description: [
                        'Developed responsive frontend interfaces using React and Redux',
                        'Integrated 3rd party payment gateways processing $2M annually'
                    ]
                }
            ]
        },
        {
            type: 'Education',
            data: [
                {
                    degree: 'B.S. Computer Science',
                    school: 'State University',
                    duration: '2014 - 2018',
                    description: 'Graduated Cum Laude. Minor in Mathematics.'
                }
            ]
        },
        {
            type: 'Skills',
            data: ['TypeScript', 'Node.js', 'React', 'PostgreSQL', 'Docker', 'AWS', 'GraphQL']
        }
    ]
};

export class TemplateController {
    async getAvailableTemplates(req: Request, res: Response, next: NextFunction) {
        try {
            const templates = templateService.getAvailableTemplates();
            sendSuccess(res, templates);
        } catch (error) {
            next(error);
        }
    }

    async generatePreview(req: Request, res: Response, next: NextFunction) {
        try {
            const id = String(req.params.id);

            // Verify template exists
            const templates = templateService.getAvailableTemplates();
            if (!templates.find(t => t.id === id)) {
                throw new NotFoundError('Template not found');
            }

            // Define preview cache directory
            const cacheDir = path.join(__dirname, '..', '..', 'uploads', 'previews');
            if (!fs.existsSync(cacheDir)) {
                fs.mkdirSync(cacheDir, { recursive: true });
            }

            const cachedImagePath = path.join(cacheDir, `${id}.png`);

            // If we already generated this thumbnail, serve it directly
            if (fs.existsSync(cachedImagePath)) {
                const buffer = fs.readFileSync(cachedImagePath);
                res.setHeader('Content-Type', 'image/png');
                res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
                return res.send(buffer);
            }

            // 1. Render Sample Data to HTML
            const html = templateService.renderToHtml(id, SAMPLE_RESUME_DATA);

            // 2. Generate PNG via Puppeteer
            const imageBuffer = await pdfService.generateScreenshot(html);

            // 3. Save to cache
            fs.writeFileSync(cachedImagePath, imageBuffer);

            // 4. Return Output
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Cache-Control', 'public, max-age=86400');
            res.send(imageBuffer);

        } catch (error) {
            next(error);
        }
    }
}

export const templateController = new TemplateController();
