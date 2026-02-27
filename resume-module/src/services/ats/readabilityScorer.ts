import { ReadabilityResult } from '../../types/ats.types';

const ACTION_VERBS = new Set([
    'achieved', 'administered', 'analyzed', 'architected', 'automated',
    'built', 'collaborated', 'configured', 'coordinated', 'created',
    'decreased', 'delivered', 'deployed', 'designed', 'developed',
    'directed', 'drove', 'eliminated', 'engineered', 'established',
    'executed', 'expanded', 'generated', 'grew', 'implemented',
    'improved', 'increased', 'integrated', 'launched', 'led',
    'maintained', 'managed', 'mentored', 'migrated', 'negotiated',
    'operated', 'optimized', 'orchestrated', 'organized', 'pioneered',
    'planned', 'produced', 'reduced', 'refactored', 'resolved',
    'scaled', 'simplified', 'spearheaded', 'streamlined', 'supervised'
]);

export const scoreReadability = (text: string): ReadabilityResult => {
    // 1. Sentence parsing
    // Split by standard sentence terminators, crude approximation but works for resumes
    const sentences = text.split(/[.?!]+/);
    const validSentences = sentences.filter(s => s.trim().split(/\s+/).length > 2); // Ignore single word "sentences"

    // 2. Word parsing
    const words = text.split(/[\s,;:\(\)\[\]\{\}\.\?\!\"\'\`\-\|\\\/]+/).filter(w => w.length > 0);
    const totalWords = words.length;

    // Averages
    const avgSentenceLength = validSentences.length > 0 ? (totalWords / validSentences.length) : 0;

    const charsTotal = words.reduce((acc, word) => acc + word.length, 0);
    const avgWordLength = totalWords > 0 ? (charsTotal / totalWords) : 0;

    // 3. Bullet & Line analysis
    const lines = text.split(/\r\n|\r|\n/);
    const bulletRegex = /^[\s]*[•\-\*▪►●‣⁃]/;

    let bulletCount = 0;
    let actionVerbCount = 0;
    let quantificationCount = 0;

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.length === 0) continue;

        // Check if line contains numbers/metrics (quantification)
        const hasNumber = /\b\d+(\.\d+)?%?\b/.test(trimmed);
        if (hasNumber) {
            quantificationCount++;
        }

        // Check if line is a bullet point
        if (bulletRegex.test(line)) {
            bulletCount++;

            // Clean bullet char off the front to check the first real word
            const contentStart = trimmed.replace(bulletRegex, '').trim();
            const firstWordMatch = contentStart.match(/^[a-zA-Z]+/);

            if (firstWordMatch) {
                const firstWord = firstWordMatch[0].toLowerCase();
                // Alternatively, just check if ANY of the action verbs are near the start of the bullet.
                // The MVP strictly asks for "bullets starting with action verbs"
                if (ACTION_VERBS.has(firstWord)) {
                    actionVerbCount++;
                }
            }
        }
    }

    const actionVerbRatio = bulletCount > 0 ? (actionVerbCount / bulletCount) : 0;
    const quantificationRatio = bulletCount > 0 ? (quantificationCount / bulletCount) : 0;

    // 4. Scoring (Max 100)
    let score = 0;

    // a. avgSentenceLength: 10-25 words (25 pts), -5 per 5 words outside
    if (avgSentenceLength >= 10 && avgSentenceLength <= 25) {
        score += 25;
    } else {
        const diff = avgSentenceLength < 10
            ? (10 - avgSentenceLength)
            : (avgSentenceLength - 25);
        const penalty = Math.ceil(diff / 5) * 5;
        score += Math.max(0, 25 - penalty);
    }

    // b. actionVerbRatio >= 0.5 (25 pts), ratio * 50
    score += Math.min(25, actionVerbRatio * 50);

    // c. quantificationRatio >= 0.3 (25 pts), ratio * 83
    score += Math.min(25, quantificationRatio * 83);

    // d. bulletCount >= 6 (25 pts)
    score += Math.min(25, (bulletCount / 6) * 25);

    score = Math.round(score);

    return {
        metrics: {
            avgSentenceLength: Number(avgSentenceLength.toFixed(1)),
            avgWordLength: Number(avgWordLength.toFixed(1)),
            bulletCount,
            actionVerbCount,
            actionVerbRatio: Number(actionVerbRatio.toFixed(2)),
            quantificationCount,
            quantificationRatio: Number(quantificationRatio.toFixed(2))
        },
        score
    };
};
