import {
    SectionDetectionResult,
    KeywordMatchResult,
    FormatAnalysisResult,
    ReadabilityResult,
    AtsFinalReport
} from '../../types/ats.types';

export const aggregateScore = (
    sections: SectionDetectionResult,
    keywords: KeywordMatchResult | null,
    formatting: FormatAnalysisResult,
    readability: ReadabilityResult,
    hasJd: boolean
): AtsFinalReport => {

    // Define weights based on whether a Job Description was provided
    const weights = hasJd ? {
        keyword: 0.40,
        sections: 0.15,
        formatting: 0.25,
        readability: 0.20
    } : {
        keyword: 0.00,
        sections: 0.25,
        formatting: 0.40,
        readability: 0.35
    };

    // Extract sub-scores
    const keywordScore = keywords ? keywords.score : 0;
    const sectionsScore = sections.score;
    const formattingScore = formatting.score;
    const readabilityScore = readability.score;

    // Calculate weighted component values
    const keywordWeighted = keywordScore * weights.keyword;
    const sectionsWeighted = sectionsScore * weights.sections;
    const formattingWeighted = formattingScore * weights.formatting;
    const readabilityWeighted = readabilityScore * weights.readability;

    // Calculate final score
    const overallScore = Math.round(
        keywordWeighted +
        sectionsWeighted +
        formattingWeighted +
        readabilityWeighted
    );

    // Determine Label and Color
    let label = '';
    let color = '';

    if (overallScore >= 90) {
        label = 'Excellent';
        color = '#22c55e';
    } else if (overallScore >= 75) {
        label = 'Good';
        color = '#84cc16';
    } else if (overallScore >= 60) {
        label = 'Fair';
        color = '#eab308';
    } else if (overallScore >= 40) {
        label = 'Needs Work';
        color = '#f97316';
    } else {
        label = 'Poor';
        color = '#ef4444';
    }

    return {
        overallScore,
        label,
        color,
        breakdown: {
            keyword: {
                score: keywordScore,
                weight: weights.keyword,
                weighted: Number(keywordWeighted.toFixed(2))
            },
            sections: {
                score: sectionsScore,
                weight: weights.sections,
                weighted: Number(sectionsWeighted.toFixed(2))
            },
            formatting: {
                score: formattingScore,
                weight: weights.formatting,
                weighted: Number(formattingWeighted.toFixed(2))
            },
            readability: {
                score: readabilityScore,
                weight: weights.readability,
                weighted: Number(readabilityWeighted.toFixed(2))
            }
        }
    };
};
