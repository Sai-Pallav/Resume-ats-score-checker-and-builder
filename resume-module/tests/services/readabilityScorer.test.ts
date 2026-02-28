import { describe, it, expect } from 'vitest';
import { scoreReadability } from '../../src/services/ats/readabilityScorer';

describe('Readability Scorer', () => {
    it('handles perfectly formatted text and scores 100', () => {
        // Create an ideal text: 
        // avgSentenceLength 10-25 words
        // action verbs >= 0.5 ratio
        // quantification >= 0.3 ratio
        // bullet point count >= 6
        const idealText = `
        • Spearheaded the development of a scalable backend architecture for 1000s of users.
        • Engineered a 20% reduction in cloud costs through optimized queries.
        • Led a cross-functional team of 5 developers to deliver projects on time.
        • Automated CI/CD pipelines, decreasing deployment time by 50%.
        • Managed the migration of legacy services to microservices in 3 months.
        • Optimized database performance, improving response times by 30 percent.
        `;

        const result = scoreReadability(idealText);

        expect(result.metrics.bulletCount).toBe(6);
        expect(result.metrics.actionVerbCount).toBeGreaterThanOrEqual(3);
        expect(result.metrics.quantificationCount).toBeGreaterThanOrEqual(2);

        // Exact 100 is expected because all constraints are met perfectly.
        expect(result.score).toBe(100);
    });

    it('penalizes text with no action verbs, no numbers, and no bullets', () => {
        const poorText = `
        I did some work on the project. It was good. I helped the team. We finished the project.
        The client was happy with the work. I wrote some code and it worked fine.
        `;
        const result = scoreReadability(poorText);
        expect(result.metrics.bulletCount).toBe(0);
        expect(result.metrics.actionVerbRatio).toBe(0);
        expect(result.metrics.quantificationRatio).toBe(0);

        // Bullets=0 -> 0 pts
        // ActionVerbs=0 -> 0 pts
        // Quantification=0 -> 0 pts
        // Sentencelength: ~5-6 words, very short penalty -> 10 words is min, diff 4-5 words -> -5 penalty. So 25 - 5 = 20 pts.
        // Total should be around 20.
        expect(result.score).toBeLessThan(30);
    });
});
