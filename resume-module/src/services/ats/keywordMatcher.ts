import { KeywordMatchResult } from '../../types/ats.types';
import { TECHNICAL_SKILLS, SOFT_SKILLS } from './skillLibrary';

const STOP_WORDS = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'shall', 'can',
    'and', 'or', 'but', 'if', 'then', 'else', 'when', 'at', 'by', 'for', 'with', 'about',
    'against', 'between', 'through', 'during', 'before', 'after', 'above', 'below',
    'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further',
    'of', 'into', 'that', 'this', 'these', 'those', 'not', 'no', 'we', 'you', 'they', 'he',
    'she', 'it', 'i', 'me', 'my', 'your', 'our', 'their', 'its', 'who', 'whom', 'which', 'what',
    'where', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some',
    'such', 'than', 'too', 'very', 'just', 'also', 'only', 'own', 'same', 'so', 'as', 'well',
    'looking', 'seeking', 'required', 'preferred', 'must', 'ability', 'strong',
    'excellent', 'good', 'work', 'working', 'team', 'role', 'position', 'company',
    'candidate', 'ideal', 'responsible', 'responsibilities', 'qualifications',
    'minimum', 'years', 'experience', 'including', 'using', 'etc', 'e.g', 'i.e'
]);

const COMMON_TECH_BIGRAMS = new Set([
    'machine learning', 'react native', 'node js', 'ruby on rails',
    'data science', 'artificial intelligence', 'computer science',
    'amazon web services', 'google cloud platform', 'rest api',
    'unit testing', 'system design', 'agile methodology', 'scrum master',
    'project management', 'quality assurance', 'frontend development',
    'backend development', 'full stack', 'continuous integration',
    'continuous deployment', 'ci cd', 'object oriented', 'relational database',
    'version control', 'pull request', 'software engineering', 'web development',
    'mobile development', 'ui ux', 'user interface', 'user experience', 'deep learning',
    'natural language processing', 'big data', 'business intelligence'
]);

const SYNONYM_GROUPS = [
    ['javascript', 'js', 'ecmascript'],
    ['typescript', 'ts'],
    ['nodejs', 'node.js', 'node'],
    ['reactjs', 'react.js', 'react'],
    ['vuejs', 'vue.js', 'vue'],
    ['angularjs', 'angular.js', 'angular'],
    ['mongodb', 'mongo'],
    ['postgresql', 'postgres'],
    ['kubernetes', 'k8s'],
    ['docker', 'containerization'],
    ['aws', 'amazon web services'],
    ['gcp', 'google cloud platform'],
    ['azure', 'microsoft azure'],
    ['rest', 'restful', 'rest api'],
    ['css', 'css3', 'cascading style sheets'],
    ['html', 'html5'],
    ['golang', 'go']
];

/**
 * Returns all synonyms for a given word based on internal mapping.
 */
const getSynonyms = (word: string): string[] => {
    const lower = word.toLowerCase();
    const group = SYNONYM_GROUPS.find(g => g.includes(lower));
    return group ? group : [lower];
};

/**
 * Reusable matching engine for targeting specific keywords in resume text.
 */
const performMatch = (resumeLower: string, targetWords: string[]) => {
    const matched: string[] = [];
    const missing: string[] = [];
    const details: any[] = [];

    for (const kw of targetWords) {
        const originalWord = kw.replace(/_/g, ' ');
        const searchVariations = getSynonyms(originalWord);

        let totalFrequency = 0;
        for (const variation of searchVariations) {
            const escaped = variation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const flexibleSpace = escaped.replace(/\\\s+/g, '\\s+');
            const pattern = `(?:^|(?<=[^a-zA-Z0-9]))${flexibleSpace}(?=[^a-zA-Z0-9]|$)`;
            const regex = new RegExp(pattern, 'gi');

            const matches = resumeLower.match(regex);
            if (matches) {
                totalFrequency += matches.length;
            }
        }

        const found = totalFrequency > 0;
        details.push({ keyword: originalWord, found, frequency: totalFrequency });

        if (found) {
            matched.push(originalWord);
        } else {
            missing.push(originalWord);
        }
    }

    return { matched, missing, details };
};

export const matchKeywords = (resumeText: string, jobDescription: string | null): KeywordMatchResult => {
    const normalize = (t: string) => t.replace(/[\u00A0\u1680\u180E\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g, ' ')
        .replace(/\s+/g, ' ')
        .toLowerCase();

    const resumeLower = normalize(resumeText);

    // CASE A: No Job Description provided -> General Skill Extraction
    if (!jobDescription || jobDescription.trim().length === 0) {
        const { matched: matchedHard, details: hardDetails } = performMatch(resumeLower, TECHNICAL_SKILLS);
        const { matched: matchedSoft } = performMatch(resumeLower, SOFT_SKILLS);
        const allMatched = Array.from(new Set([...matchedHard, ...matchedSoft]));

        // Dynamic score for general scan based on skill count (e.g., 15+ skills = 100%)
        const skillDensityScore = Math.min(Math.round((matchedHard.length / 15) * 100), 100);

        return {
            jdKeywords: TECHNICAL_SKILLS,
            matched: allMatched,
            missing: [], // Don't flag missing skills in general mode
            matchRate: matchedHard.length / 15,
            score: skillDensityScore,
            matchedHard,
            matchedSoft,
            details: hardDetails.filter(d => d.found)
        };
    }

    // CASE B: Job Description provided -> Targeted Keyword Matching
    const jdLower = normalize(jobDescription);
    let preprocessedJd = jdLower;
    const sortedBigrams = Array.from(COMMON_TECH_BIGRAMS).sort((a, b) => b.length - a.length);
    for (const bigram of sortedBigrams) {
        if (preprocessedJd.includes(bigram)) {
            const bigramRegex = new RegExp(`\\b${bigram}\\b`, 'gi');
            preprocessedJd = preprocessedJd.replace(bigramRegex, bigram.replace(/\s+/g, '_'));
        }
    }

    const rawTokens = preprocessedJd.split(/[\s,;:\(\)\[\]\{\}\?\!\"\'\`\|\\\/]+/);
    const jdTokensSet = new Set<string>();
    for (const token of rawTokens) {
        const cleanToken = token.replace(/[.,:;]$/, '');
        if (cleanToken.length >= 2 && !STOP_WORDS.has(cleanToken)) {
            jdTokensSet.add(cleanToken);
        }
    }

    const jdKeywords = Array.from(jdTokensSet);
    const { matched, missing, details } = performMatch(resumeLower, jdKeywords);

    // Score calculation
    const total = jdKeywords.length;
    let score = 0;
    let matchRate = 0;

    if (total > 0) {
        matchRate = matched.length / total;
        score = Math.round(matchRate * 100);
    }

    details.sort((a, b) => a.keyword.localeCompare(b.keyword));

    return {
        jdKeywords: jdKeywords.map(kw => kw.replace(/_/g, ' ')),
        matched,
        missing,
        matchRate,
        score,
        details
    };
};
