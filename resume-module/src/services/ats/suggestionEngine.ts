import {
    SectionDetectionResult,
    KeywordMatchResult,
    FormatAnalysisResult,
    ReadabilityResult,
    SuggestionResult,
    Suggestion
} from '../../types/ats.types';

export const generateSuggestions = (
    sections: SectionDetectionResult,
    keywords: KeywordMatchResult | null,
    formatting: FormatAnalysisResult,
    readability: ReadabilityResult,
    wordCount: number,
    pageCount: number
): SuggestionResult => {
    const suggestions: Suggestion[] = [];

    // Helper to extract boolean pass/fail from formatting results
    const getFormatCheck = (name: string): boolean => {
        const check = formatting.checks.find(c => c.name === name);
        return check ? check.passed : false;
    };

    const addSuggestion = (suggestion: Suggestion) => {
        suggestions.push(suggestion);
    };

    // --- KEYWORDS RULES ---
    if (keywords) {
        if (keywords.missing.length > 5) {
            addSuggestion({
                id: 'KW-001',
                category: 'keywords',
                priority: 'HIGH',
                title: 'Many missing keywords from job description',
                message: `You are missing ${keywords.missing.length} important keywords from the job description. Consider naturally weaving these terms into your experience bullets: ${keywords.missing.slice(0, 5).join(', ')}...`
            });
        } else if (keywords.missing.length > 0 && keywords.missing.length <= 5) {
            addSuggestion({
                id: 'KW-002',
                category: 'keywords',
                priority: 'MEDIUM',
                title: 'Some keywords missing from job description',
                message: `Try to include these missing JD keywords if you have the relevant experience: ${keywords.missing.join(', ')}`
            });
        }

        if (keywords.score < 30) {
            addSuggestion({
                id: 'KW-003',
                category: 'keywords',
                priority: 'HIGH',
                title: 'Very low keyword match rate',
                message: 'Your resume text does not strongly align with the job description terminology. Tailor your resume specifically for this role to pass ATS keyword filters.'
            });
        }
    }

    // --- SECTIONS RULES ---
    if (sections.missing.includes('summary')) {
        addSuggestion({
            id: 'SC-001',
            category: 'sections',
            priority: 'MEDIUM',
            title: 'Add a Professional Summary section',
            message: 'A brief 2-3 sentence summary at the top helps recruiters quickly understand your value proposition.'
        });
    }

    if (sections.missing.includes('skills')) {
        addSuggestion({
            id: 'SC-002',
            category: 'sections',
            priority: 'HIGH',
            title: 'Add a Skills section',
            message: 'ATS systems heavily rely on a dedicated skills section to parse your core competencies. Add one immediately.'
        });
    }

    if (sections.missing.includes('education')) {
        addSuggestion({
            id: 'SC-003',
            category: 'sections',
            priority: 'MEDIUM',
            title: 'Add an Education section',
            message: 'Include your degrees or relevant coursework, as many ATS systems check mandatory education requirements.'
        });
    }

    if (sections.missing.includes('experience')) {
        addSuggestion({
            id: 'SC-004',
            category: 'sections',
            priority: 'HIGH',
            title: 'Add a Work Experience section',
            message: 'Your professional experience is missing or formatting prevented it from being detected. Ensure you have a clear "Experience" header.'
        });
    }

    if (sections.detected.length < 4) {
        addSuggestion({
            id: 'SC-005',
            category: 'sections',
            priority: 'HIGH',
            title: 'Resume has too few sections',
            message: 'Your resume lacks standard structural sections. Aim for at least 4 core sections (e.g., Summary, Experience, Education, Skills).'
        });
    }

    // --- FORMATTING RULES ---
    if (!getFormatCheck('email_present')) {
        addSuggestion({
            id: 'FM-001',
            category: 'formatting',
            priority: 'HIGH',
            title: 'Add a professional email address',
            message: 'No email address was detected. Provide a standard professional email (e.g., first.last@gmail.com) in your contact header.'
        });
    }

    if (!getFormatCheck('phone_present')) {
        addSuggestion({
            id: 'FM-002',
            category: 'formatting',
            priority: 'MEDIUM',
            title: 'Add a phone number',
            message: 'No recognizable phone number was found. Recruiters need a direct way to call you.'
        });
    }

    if (wordCount < 200) {
        addSuggestion({
            id: 'FM-003',
            category: 'formatting',
            priority: 'HIGH',
            title: 'Resume is too short',
            message: `Your resume only has ${wordCount} words. Provide more detail about your achievements to meet the ideal 200+ word threshold.`
        });
    } else if (wordCount > 1200) {
        addSuggestion({
            id: 'FM-004',
            category: 'formatting',
            priority: 'MEDIUM',
            title: 'Resume may be too long',
            message: `Your resume sits at ${wordCount} words. Consider trimming older or less relevant roles to keep it concise.`
        });
    }

    if (pageCount > 2) {
        addSuggestion({
            id: 'FM-005',
            category: 'formatting',
            priority: 'MEDIUM',
            title: 'Condense resume to 1-2 pages',
            message: `You have ${pageCount} pages. Unless you have over 10 years of experience or are in academia, strictly stick to 1-2 pages.`
        });
    }

    if (!getFormatCheck('has_bullet_points')) {
        addSuggestion({
            id: 'FM-006',
            category: 'formatting',
            priority: 'HIGH',
            title: 'Use bullet points for achievements',
            message: 'Large blocks of text are hard to read. Break your job descriptions down into standard bullet points.'
        });
    }

    // --- READABILITY RULES ---
    if (readability.metrics.actionVerbRatio < 0.3) {
        addSuggestion({
            id: 'RD-001',
            category: 'readability',
            priority: 'MEDIUM',
            title: 'Start more bullets with action verbs',
            message: 'Too few of your bullet points start with strong action verbs. Swap weak openers with words like "Spearheaded", "Engineered", or "Optimized".'
        });
    }

    if (readability.metrics.quantificationRatio < 0.2) {
        addSuggestion({
            id: 'RD-002',
            category: 'readability',
            priority: 'MEDIUM',
            title: 'Add more metrics and numbers',
            message: 'Your resume lacks measurable outcomes. Quantify your achievements (e.g., "grew revenue by 15%", "managed team of 5").'
        });
    }

    if (readability.metrics.avgSentenceLength > 30) {
        addSuggestion({
            id: 'RD-003',
            category: 'readability',
            priority: 'LOW',
            title: 'Shorten your sentences',
            message: `Your average sentence length is ${readability.metrics.avgSentenceLength} words. Break up run-on sentences to ensure quick scannability.`
        });
    }

    if (readability.metrics.bulletCount < 4) {
        addSuggestion({
            id: 'RD-004',
            category: 'readability',
            priority: 'MEDIUM',
            title: 'Add more bullet points to describe achievements',
            message: 'You have very few bullet points. Expand on your job responsibilities with robust, achievement-driven bullet points.'
        });
    }

    // Sort suggestions by priority and category
    const priorityWeight: Record<string, number> = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
    const categoryWeight: Record<string, number> = { 'keywords': 4, 'sections': 3, 'readability': 2, 'formatting': 1 };

    suggestions.sort((a, b) => {
        // Primary sort: Priority (HIGH > MEDIUM > LOW)
        const pA = priorityWeight[a.priority] || 0;
        const pB = priorityWeight[b.priority] || 0;
        if (pA !== pB) return pB - pA;

        // Secondary sort: Category (keywords > sections > readability > formatting)
        const cA = categoryWeight[a.category] || 0;
        const cB = categoryWeight[b.category] || 0;
        return cB - cA;
    });

    // Aggregate Counts
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;

    for (const sug of suggestions) {
        if (sug.priority === 'HIGH') highCount++;
        if (sug.priority === 'MEDIUM') mediumCount++;
        if (sug.priority === 'LOW') lowCount++;
    }

    return {
        suggestions,
        totalCount: suggestions.length,
        highCount,
        mediumCount,
        lowCount
    };
};
