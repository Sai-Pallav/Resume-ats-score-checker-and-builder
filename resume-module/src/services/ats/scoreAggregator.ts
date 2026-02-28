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
    hasJd: boolean,
    successFlags?: {
        sectionsSuccess: boolean;
        keywordsSuccess: boolean;
        formattingSuccess: boolean;
        readabilitySuccess: boolean;
        isTimeout?: boolean;
    }
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

    // Proportional Weight Fail-Safe Logic
    // If any module crashed/failed, its successFlag is false. We pull its weight out
    // and distribute the gap equally among the remaining successful modules.
    if (successFlags) {
        if (!successFlags.keywordsSuccess) weights.keyword = 0;
        if (!successFlags.sectionsSuccess) weights.sections = 0;
        if (!successFlags.formattingSuccess) weights.formatting = 0;
        if (!successFlags.readabilitySuccess) weights.readability = 0;

        const totalRemainingWeight = weights.keyword + weights.sections + weights.formatting + weights.readability;

        // Scale remaining up to 1.0 (100%)
        if (totalRemainingWeight > 0 && totalRemainingWeight < 1.0) {
            const scaleFactor = 1.0 / totalRemainingWeight;
            weights.keyword *= scaleFactor;
            weights.sections *= scaleFactor;
            weights.formatting *= scaleFactor;
            weights.readability *= scaleFactor;
        }
    }

    // Extract sub-scores (0 if failed)
    const keywordScore = (successFlags?.keywordsSuccess !== false && keywords) ? keywords.score : 0;
    const sectionsScore = successFlags?.sectionsSuccess !== false ? sections.score : 0;
    const formattingScore = successFlags?.formattingSuccess !== false ? formatting.score : 0;
    const readabilityScore = successFlags?.readabilitySuccess !== false ? readability.score : 0;

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

    // Generate Explanations for Point Reductions
    const getSectionExplanations = (): string[] => {
        if (successFlags && !successFlags.sectionsSuccess) return ['Section analysis encountered an error. Score omitted.'];
        const expl: string[] = [];
        if (sections.missing.length > 0) {
            expl.push(`Missing standard sections: ${sections.missing.join(', ')}`);
        }
        if (sections.score === 100) {
            expl.push('All core sections detected cleanly.');
        }
        return expl;
    };

    const getKeywordExplanations = (): string[] => {
        if (successFlags && !successFlags.keywordsSuccess) return ['Keyword analysis encountered an error. Score omitted.'];
        if (!hasJd || !keywords) return ['No Job Description provided to match against.'];
        const expl: string[] = [];
        if (keywords.missing.length > 0) {
            const topMissing = keywords.missing.slice(0, 3).join(', ');
            expl.push(`Missing critical job keywords: ${topMissing}${keywords.missing.length > 3 ? '...' : ''}`);
        }
        if (keywords.score < 50) {
            expl.push('Poor keyword overlap with the Job Description.');
        } else if (keywords.score > 85) {
            expl.push('Excellent keyword matching!');
        }
        return expl;
    };

    const getFormattingExplanations = (): string[] => {
        if (successFlags && !successFlags.formattingSuccess) return ['Formatting analysis encountered an error. Score omitted.'];
        const expl: string[] = [];
        const failedChecks = formatting.checks.filter(c => !c.passed);
        if (failedChecks.length > 0) {
            failedChecks.forEach(c => expl.push(c.detail));
        } else {
            expl.push('Formatting and length heuristics are optimal.');
        }
        return expl;
    };

    const getReadabilityExplanations = (): string[] => {
        if (successFlags && !successFlags.readabilitySuccess) return ['Readability analysis encountered an error. Score omitted.'];
        const expl: string[] = [];
        if (readability.metrics.avgSentenceLength > 20) {
            expl.push('Average sentence length is too long (aim for < 20 words).');
        }
        if (readability.metrics.actionVerbRatio < 0.5) {
            expl.push('Weak verbs detected; start bullets with strong Action Verbs.');
        }
        if (readability.metrics.quantificationRatio < 0.2) {
            expl.push('Lack of quantified results (numbers, percentages, $).');
        }
        if (expl.length === 0) {
            expl.push('Excellent linguistic readability and metric quantification.');
        }
        return expl;
    };

    return {
        overallScore,
        label,
        color,
        breakdown: {
            keyword: {
                score: keywordScore,
                weight: Number(weights.keyword.toFixed(2)),
                weighted: Number(keywordWeighted.toFixed(2)),
                explanations: getKeywordExplanations()
            },
            sections: {
                score: sectionsScore,
                weight: Number(weights.sections.toFixed(2)),
                weighted: Number(sectionsWeighted.toFixed(2)),
                explanations: getSectionExplanations()
            },
            formatting: {
                score: formattingScore,
                weight: Number(weights.formatting.toFixed(2)),
                weighted: Number(formattingWeighted.toFixed(2)),
                explanations: getFormattingExplanations()
            },
            readability: {
                score: readabilityScore,
                weight: Number(weights.readability.toFixed(2)),
                weighted: Number(readabilityWeighted.toFixed(2)),
                explanations: getReadabilityExplanations()
            }
        },
        metrics: {
            keywordDensity: keywords ? Math.round(keywords.matchRate * 100) : 0,
            sectionCompleteness: sections.score,
            bulletQuality: Math.round(Math.min(readability.metrics.actionVerbRatio * 100, 100)),
            quantificationRatio: Math.round(Math.min(readability.metrics.quantificationRatio * 100, 100))
        },
        warnings: successFlags?.isTimeout ? ['Analysis partially completed due to execution timeout.'] : []
    };
};
