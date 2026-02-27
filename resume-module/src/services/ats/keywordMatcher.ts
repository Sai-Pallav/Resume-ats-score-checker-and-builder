import { KeywordMatchResult } from '../../types/ats.types';

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

export const matchKeywords = (resumeText: string, jobDescription: string): KeywordMatchResult => {
    const jdLower = jobDescription.toLowerCase();
    const resumeLower = resumeText.toLowerCase();

    // 1. Group multi-word terms in JD into single tokens with underscores
    let preprocessedJd = jdLower;
    for (const bigram of COMMON_TECH_BIGRAMS) {
        if (preprocessedJd.includes(bigram)) {
            // Replace with underscore version e.g., "machine_learning"
            preprocessedJd = preprocessedJd.split(bigram).join(bigram.replace(/\s+/g, '_'));
        }
    }

    // 2. Tokenize JD → split by whitespace + punctuation
    const rawTokens = preprocessedJd.split(/[\s,;:\(\)\[\]\{\}\.\?\!\"\'\`\-\|\\\/]+/);

    // 3. Remove stop words & tokens < 2 chars & Deduplicate
    const jdTokensSet = new Set<string>();

    for (const token of rawTokens) {
        if (token.length >= 2 && !STOP_WORDS.has(token)) {
            jdTokensSet.add(token);
        }
    }

    const jdKeywords = Array.from(jdTokensSet);
    const matched: string[] = [];
    const missing: string[] = [];
    const details: KeywordMatchResult['details'] = [];

    // 4. For each keyword, check lowercase resume text
    for (const kw of jdKeywords) {
        // Restore spaces for bigrams to search in the resume text natively e.g., "machine_learning" -> "machine learning"
        const searchWord = kw.replace(/_/g, ' ');

        // Use regex for exact word boundary match if it's a single word without special symbols
        // If it has symbols (like C++, Node.js), a simple string search is safer as regex boundaries fail on ++  
        const isAlphaNumeric = /^[a-z0-9 ]+$/i.test(searchWord);

        let frequency = 0;

        if (isAlphaNumeric) {
            const regex = new RegExp(`\\b${searchWord}\\b`, 'gi');
            const matches = resumeLower.match(regex);
            if (matches) {
                frequency = matches.length;
            }
        } else {
            // Fallback for keywords with symbols
            let index = resumeLower.indexOf(searchWord);
            while (index !== -1) {
                frequency++;
                index = resumeLower.indexOf(searchWord, index + searchWord.length);
            }
        }

        const found = frequency > 0;

        details.push({
            keyword: searchWord,
            found,
            frequency
        });

        if (found) {
            matched.push(searchWord);
        } else {
            missing.push(searchWord);
        }
    }

    // 5. Score = (matched / total) * 100
    const total = jdKeywords.length;
    let score = 0;
    let matchRate = 0;

    if (total > 0) {
        matchRate = matched.length / total;
        score = Math.round(matchRate * 100);
    }

    // Sort details alphabetically for consistent outputs
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
