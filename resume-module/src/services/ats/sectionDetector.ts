import { SectionDetectionResult } from '../../types/ats.types';

const SECTION_PATTERNS: Record<string, RegExp[]> = {
    contact: [
        /\b[\w.-]+@[\w.-]+\.\w{2,}\b/,
        /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/,
        /linkedin\.com/i
    ],
    summary: [/\b(summary|objective|profile|about\s*me|professional\s*summary)\b/i],
    experience: [/\b(experience|work\s*history|employment|professional\s*experience)\b/i],
    education: [/\b(education|academic|university|college|degree|school)\b/i],
    skills: [/\b(skills|technologies|technical\s*skills|competencies|proficiencies)\b/i],
    projects: [/\b(projects|personal\s*projects|portfolio|side\s*projects)\b/i],
    certifications: [/\b(certifications?|licenses?|credentials?|accreditations?)\b/i]
};

export const detectSections = (text: string): SectionDetectionResult => {
    const detected: string[] = [];
    const missing: string[] = [];
    const details: SectionDetectionResult['details'] = {};

    const EXPECTED_COUNT = Object.keys(SECTION_PATTERNS).length;

    for (const [section, patterns] of Object.entries(SECTION_PATTERNS)) {
        let found = false;
        let matchedPattern: string | null = null;
        let position = -1;

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match.index !== undefined) {
                found = true;
                matchedPattern = pattern.source;
                position = match.index;
                break; // Stop checking other patterns for this section if one matches
            }
        }

        details[section] = { found, matchedPattern, position };

        if (found) {
            detected.push(section);
        } else {
            missing.push(section);
        }
    }

    const score = Math.round((detected.length / EXPECTED_COUNT) * 100);

    return {
        detected,
        missing,
        details,
        score
    };
};
