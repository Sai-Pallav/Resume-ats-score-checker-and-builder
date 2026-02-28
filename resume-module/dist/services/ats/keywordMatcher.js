"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchKeywords = void 0;
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
 * Creates a helper regex that matches a word only if it is surrounded by non-alphanumeric boundaries.
 * This is more robust than \b for keywords ending in symbols (like C++, .NET).
 */
const createSafeWordRegex = (word) => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Custom word boundaries: Start of string or non-alphanumeric | Word | End of string or non-alphanumeric
    const pattern = `(?:^|(?<=[^a-zA-Z0-9]))${escaped}(?=[^a-zA-Z0-9]|$)`;
    return new RegExp(pattern, 'gi');
};
/**
 * Returns all synonyms for a given word based on internal mapping.
 */
const getSynonyms = (word) => {
    const lower = word.toLowerCase();
    const group = SYNONYM_GROUPS.find(g => g.includes(lower));
    return group ? group : [lower];
};
const matchKeywords = (resumeText, jobDescription) => {
    const jdLower = jobDescription.toLowerCase();
    const resumeLower = resumeText.toLowerCase();
    // 1. Group multi-word terms in JD into single tokens with underscores
    let preprocessedJd = jdLower;
    for (const bigram of COMMON_TECH_BIGRAMS) {
        if (preprocessedJd.includes(bigram)) {
            preprocessedJd = preprocessedJd.split(bigram).join(bigram.replace(/\s+/g, '_'));
        }
    }
    // 2. Tokenize JD
    const rawTokens = preprocessedJd.split(/[\s,;:\(\)\[\]\{\}\.\?\!\"\'\`\-\|\\\/]+/);
    // 3. Filter & Deduplicate
    const jdTokensSet = new Set();
    for (const token of rawTokens) {
        if (token.length >= 2 && !STOP_WORDS.has(token)) {
            jdTokensSet.add(token);
        }
    }
    const jdKeywords = Array.from(jdTokensSet);
    const matched = [];
    const missing = [];
    const details = [];
    // 4. Match using safe boundaries and synonyms
    for (const kw of jdKeywords) {
        const originalWord = kw.replace(/_/g, ' ');
        const searchVariations = getSynonyms(originalWord);
        let totalFrequency = 0;
        let bestMatchVariation = null;
        for (const variation of searchVariations) {
            const regex = createSafeWordRegex(variation);
            const matches = resumeLower.match(regex);
            if (matches) {
                totalFrequency += matches.length;
                if (!bestMatchVariation)
                    bestMatchVariation = variation;
            }
        }
        const found = totalFrequency > 0;
        details.push({
            keyword: originalWord,
            found,
            frequency: totalFrequency
        });
        if (found) {
            matched.push(originalWord);
        }
        else {
            missing.push(originalWord);
        }
    }
    // 5. Score calculation
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
exports.matchKeywords = matchKeywords;
//# sourceMappingURL=keywordMatcher.js.map