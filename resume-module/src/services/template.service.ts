import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';

const TEMPLATE_DIR = path.join(__dirname, '..', 'templates');

// Register Handlebars helpers
Handlebars.registerHelper('eq', function (a: string, b: string) {
    return a === b;
});

Handlebars.registerHelper('join', function (array: string[], separator: string) {
    if (!array || !Array.isArray(array)) return '';
    return array.join(separator);
});

// Cache compiled templates
const templateCache = new Map<string, HandlebarsTemplateDelegate>();

export class TemplateService {
    getAvailableTemplates() {
        return [
            { id: 'classic', name: 'Classic', description: 'Traditional serif-based academic style' },
            { id: 'modern', name: 'Modern', description: 'Clean sans-serif professional look' },
            { id: 'minimal', name: 'Minimal', description: 'Ultra-clean whitespace focused' },
        ];
    }

    renderToHtml(templateId: string, resumeData: any): string {
        const safeTemplateId = this.getAvailableTemplates().some(t => t.id === templateId) ? templateId : 'classic';

        let compiled = templateCache.get(safeTemplateId);

        if (!compiled) {
            const filePath = path.join(TEMPLATE_DIR, `${safeTemplateId}.hbs`);
            if (!fs.existsSync(filePath)) {
                throw new Error(`Template file ${filePath} not found`);
            }
            const source = fs.readFileSync(filePath, 'utf-8');
            compiled = Handlebars.compile(source);
            templateCache.set(safeTemplateId, compiled);
        }

        return compiled(resumeData);
    }
}

export const templateService = new TemplateService();
