"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchKeywords = matchKeywords;
const STOP_WORDS = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'could', 'should', 'may', 'might', 'shall', 'can',
    'and', 'or', 'but', 'if', 'then', 'else', 'when', 'at', 'by',
    'for', 'with', 'about', 'against', 'between', 'through', 'during',
    'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down',
    'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further',
    'of', 'into', 'that', 'this', 'these', 'those', 'not', 'no',
    'we', 'you', 'they', 'he', 'she', 'it', 'i', 'me', 'my', 'your',
    'our', 'their', 'its', 'who', 'whom', 'which', 'what', 'where',
    'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most',
    'other', 'some', 'such', 'than', 'too', 'very', 'just', 'also',
    'only', 'own', 'same', 'so', 'as', 'well', 'looking', 'seeking',
    'required', 'preferred', 'must', 'ability', 'strong', 'excellent',
    'good', 'work', 'working', 'team', 'role', 'position', 'company',
    'candidate', 'ideal', 'responsible', 'responsibilities', 'qualifications',
    'minimum', 'years', 'experience', 'including', 'using', 'etc', 'e.g.', 'i.e.'
]);
function tokenize(text) {
    return text
        .toLowerCase()
        .split(/[\s,.;:!?()\/\\|\[\]{}]+/) // split by whitespace and common punctuation
        .filter(word => word.length >= 2) // remove tokens < 2 chars
        .filter(word => !STOP_WORDS.has(word)); // remove stop words
}
function matchKeywords(resumeText, jobDescription) {
    // 1. Tokenize JD
    const rawJdTokens = tokenize(jobDescription);
    // 2. Deduplicate JD Keywords
    const jdKeywords = Array.from(new Set(rawJdTokens));
    // 3. Normalize Resume Text
    const normalizedResumeText = resumeText.toLowerCase();
    // 4. Match
    const matched = [];
    const missing = [];
    for (const keyword of jdKeywords) {
        // Escape keywords for regex safety, look for exact word boundaries
        const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');
        if (regex.test(normalizedResumeText)) {
            matched.push(keyword);
        }
        else {
            missing.push(keyword);
        }
    }
    // 5. Score (matched / total JD keywords) * 100
    const score = jdKeywords.length > 0
        ? Math.round((matched.length / jdKeywords.length) * 100)
        : 0; // Return 0 if no valid keywords extracted
    return {
        matched,
        missing,
        jdKeywords,
        score
    };
}
//# sourceMappingURL=keywordMatcher.js.map