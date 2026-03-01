import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../styles/theme';
import { Feather } from '@expo/vector-icons';

interface HighlightProps {
    text: string;
    matchedKeywords?: string[];
    weakPhrases?: string[]; // E.g. ['responsible for', 'worked on']
}

export default function AtsHighlightView({ text, matchedKeywords = [], weakPhrases = [] }: HighlightProps) {
    if (!text) return null;

    const lines = text.split('\n');

    // Passive voice and weak pattern detection
    const WEAK_PATTERNS = [
        { id: 'responsible', regex: /\b(?:responsible|tasked|assigned|accountable)\b/i, label: 'Weak Action', suggestion: 'Try: "Spearheaded", "Orchestrated", or "Managed"' },
        { id: 'helped', regex: /\b(?:helped|assisted|supported|aided)\b/i, label: 'Passive', suggestion: 'Try: "Collaborated on", "Facilitated", or "Contributed to"' },
        { id: 'duties', regex: /\b(?:duties|responsibilities|role)\b.*?\b(?:included|were|was)\b/i, label: 'Listy', suggestion: 'Replace with direct action verbs' },
        { id: 'worked', regex: /\b(?:worked|participated|involved|part\s+of)\b/i, label: 'Vague', suggestion: 'Try: "Executed", "Developed", or "Built"' },
        { id: 'filler', regex: /\b(?:dynamic|creative|hard-working|motivated|team\s+player|results-oriented|detail-oriented)\b/i, label: 'Buzzword', suggestion: 'Show, don\'t tell: provide a concrete example of this trait' },
        { id: 'vague', regex: /\b(?:various|multiple|many|several|few|diverse|wide\s+range)\b/i, label: 'Vague', suggestion: 'Use exact numbers (e.g., "6+", "multiple" -> "3")' },
    ];

    const renderLine = (line: string, index: number) => {
        const trimmed = line.trim();
        if (!trimmed) return <View key={index} style={{ height: 12 }} />;

        const matchingPattern = WEAK_PATTERNS.find(p => p.regex.test(trimmed));
        const noMetrics = trimmed.length > 25 && !/\d/.test(trimmed);

        const isWeak = !!matchingPattern || noMetrics;

        // Prioritize specific rephrasing over general metrics advice
        let suggestionText = matchingPattern ? matchingPattern.suggestion : null;
        // removed metrics advice text as per user request, but keep isWeak true for underline

        // Simple keyword highlighting within line
        let lineElements: React.ReactNode[] = [line];

        if (matchedKeywords.length > 0) {
            const sortedKeywords = [...matchedKeywords].sort((a, b) => b.length - a.length);
            lineElements = [line];

            sortedKeywords.forEach(kw => {
                const newElements: React.ReactNode[] = [];
                lineElements.forEach(el => {
                    if (typeof el !== 'string') {
                        newElements.push(el);
                        return;
                    }

                    const parts = el.split(new RegExp(`(${kw})`, 'gi'));
                    parts.forEach((part, i) => {
                        if (part.toLowerCase() === kw.toLowerCase()) {
                            newElements.push(
                                <Text key={`${index}-${kw}-${i}`} style={styles.keywordHighlight}>
                                    {part}
                                </Text>
                            );
                        } else if (part) {
                            newElements.push(part);
                        }
                    });
                });
                lineElements = newElements;
            });
        }

        return (
            <View key={index} style={[styles.lineWrapper, isWeak ? styles.weakLineWrapper : null]}>
                <Text style={[styles.lineText, isWeak ? styles.weakText : null]}>
                    {lineElements}
                </Text>
                {suggestionText && (
                    <View style={styles.suggestionBox}>
                        <Feather name="edit-3" size={10} color={COLORS.error} />
                        <Text style={styles.suggestionTxt}>{suggestionText}</Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {lines.map((line, i) => renderLine(line, i))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: SPACING.lg,
        backgroundColor: COLORS.surface,
    },
    lineWrapper: {
        paddingVertical: 2,
        paddingHorizontal: 12,
        marginBottom: 2,
    },
    weakLineWrapper: {
        borderLeftWidth: 3,
        borderLeftColor: COLORS.error + '40',
        backgroundColor: COLORS.error + '05',
    },
    lineText: {
        fontSize: 14,
        lineHeight: 24,
        color: COLORS.text,
        fontFamily: Platform.OS === 'web' ? 'Inter, system-ui, sans-serif' : undefined,
    },
    weakText: {
        textDecorationLine: 'underline',
        textDecorationStyle: 'double',
        textDecorationColor: COLORS.error + '60',
        color: COLORS.error,
    },
    keywordHighlight: {
        color: COLORS.success,
        fontWeight: '600',
        backgroundColor: COLORS.success + '10',
        paddingHorizontal: 2,
        borderRadius: 2,
    },
    suggestionBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        backgroundColor: COLORS.error + '08',
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 4,
        gap: 6,
    },
    suggestionTxt: {
        fontSize: 11,
        color: COLORS.error,
        fontWeight: '700',
        fontStyle: 'italic',
    }
});
