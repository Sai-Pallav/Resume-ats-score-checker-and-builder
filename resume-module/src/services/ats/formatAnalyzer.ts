import { FormatAnalysisResult } from '../../types/ats.types';

export const analyzeFormat = (text: string, pageCount: number, wordCount: number): FormatAnalysisResult => {
    const checks: FormatAnalysisResult['checks'] = [];
    let totalWeight = 0;
    let passedWeight = 0;

    const addCheck = (name: string, passed: boolean, detail: string, weight: number) => {
        checks.push({ name, passed, detail, weight });
        totalWeight += weight;
        if (passed) passedWeight += weight;
    };

    // 1. Email present (Weight 3)
    const emailRegex = /[\w.-]+@[\w.-]+\.\w{2,}/;
    const hasEmail = emailRegex.test(text);
    addCheck(
        'email_present',
        hasEmail,
        hasEmail ? 'Found a professional email address.' : 'Missing email address.',
        3
    );

    // 2. Phone present (Weight 3)
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const hasPhone = phoneRegex.test(text);
    addCheck(
        'phone_present',
        hasPhone,
        hasPhone ? 'Found a phone number.' : 'Missing phone number.',
        3
    );

    // 3. Appropriate length (Weight 2)
    const lengthPass = wordCount >= 200 && wordCount <= 1200;
    addCheck(
        'appropriate_length',
        lengthPass,
        lengthPass ? `Word count (${wordCount}) is within the sweet spot (200-1200).` : `Word count (${wordCount}) is outside the ideal range (200-1200).`,
        2
    );

    // 4. Page count (Weight 2)
    const pagesPass = pageCount >= 1 && pageCount <= 2;
    addCheck(
        'page_count',
        pagesPass,
        pagesPass ? `Page count (${pageCount}) is optimal.` : `Page count (${pageCount}) should ideally be 1 or 2.`,
        2
    );

    // 5. Has bullet points (Weight 2)
    const bulletRegex = /^[\s]*[•\-\*▪►●‣⁃]/gm;
    const bulletMatches = text.match(bulletRegex);
    const hasBullets = (bulletMatches?.length || 0) >= 3;
    addCheck(
        'has_bullet_points',
        hasBullets,
        hasBullets ? 'Found adequate usage of bullet points.' : 'Missing bullet points for achievements.',
        2
    );

    // 6. No personal pronouns (Weight 1)
    const pronounRegex = /\b(I|me|my|myself)\b/gi;
    const pronounMatches = text.match(pronounRegex);
    const pronounsCount = pronounMatches?.length || 0;
    const pronounsPass = pronounsCount < 5;
    addCheck(
        'no_personal_pronouns',
        pronounsPass,
        pronounsPass ? 'Maintained professional third-party/silent-first tone.' : `Found too many personal pronouns (${pronounsCount}).`,
        1
    );

    // 7. Consistent date format (Weight 1)
    // Basic heuristic: check if more text matches one style over another. 
    // For MVP, look for common formats (MM/YYYY or YYYY) and just check if we have multiple.
    const monthYearPattern = /\b(0[1-9]|1[0-2])\/?[-]?\s?20[0-2]\d\b/g;
    const onlyYearPattern = /\b20[0-2]\d\b/g;

    // Simplification for MVP as requested: Just ensure dates exist and aren't wildly mixed 
    // (if they use MM/YYYY they should use it strictly, but if they just use YYYY that's fine too)
    const myMatches = (text.match(monthYearPattern) || []).length;
    let oyMatches = (text.match(onlyYearPattern) || []).length;
    oyMatches = Math.max(0, oyMatches - myMatches); // don't double count 2024 inside 10/2024

    let datesPass = true;
    let datesDetail = 'Date formats are consistent.';

    if (myMatches > 0 && oyMatches > 0) {
        const totalDates = myMatches + oyMatches;
        const dominantRatio = Math.max(myMatches, oyMatches) / totalDates;
        if (dominantRatio < 0.8) {
            datesPass = false;
            datesDetail = `Mixed date formats detected (e.g. MM/YYYY mixed with YYYY). Ratio: ${Math.round(dominantRatio * 100)}%`;
        }
    }

    // If no dates found at all, it's a fail because resumes need timelines
    if (myMatches === 0 && oyMatches === 0) {
        datesPass = false;
        datesDetail = 'No recognizable date formats found (MM/YYYY or YYYY).';
    }

    addCheck('consistent_date_format', datesPass, datesDetail, 1);

    // 8. Has section headers (Weight 2)
    const headerRegex = /^([A-Z]{3,}|[A-Z][a-z]+(\s[A-Z][a-z]+)*)$/gm; // ALL-CAPS or Title Case standalone lines
    const headerMatches = text.match(headerRegex);

    // Filter out very long lines that are likely just sentences
    let validHeaders = 0;
    if (headerMatches) {
        validHeaders = headerMatches.filter(h => h.trim().length > 3 && h.trim().length < 30).length;
    }

    const headersPass = validHeaders >= 3;
    addCheck(
        'has_section_headers',
        headersPass,
        headersPass ? `Found sufficient section formatting (${validHeaders} headers).` : 'Missing clearly formatted section headers (ALL-CAPS or Title Case standalone lines).',
        2
    );

    // Calculate weighted score
    const score = totalWeight > 0 ? Math.round((passedWeight / totalWeight) * 100) : 0;

    return {
        checks,
        score
    };
};
