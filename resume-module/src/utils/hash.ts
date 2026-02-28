import crypto from 'crypto';

/**
 * Generates a SHA-256 hash from resume data and template selection.
 */
export const generateResumeHash = (resumeData: any, templateId: string): string => {
    // We clean the object to ensure consistent hashing even if DB IDs or timestamps vary
    // However, the user wants to cache if UNCHANGED, so we use the JSON representation.
    const combined = JSON.stringify(resumeData) + templateId;
    return crypto.createHash('sha256').update(combined).digest('hex');
};
