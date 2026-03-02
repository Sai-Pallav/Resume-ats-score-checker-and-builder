import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, TouchableOpacity, SafeAreaView, ScrollView,
    StyleSheet, Platform, Animated, Easing, Dimensions, Clipboard, Alert
} from 'react-native';
import { globalStyles, TYPOGRAPHY, COLORS, SPACING, ROUNDING, SHADOWS } from '../styles/theme';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AtsHighlightView from '../components/AtsHighlightView';
import { exportAsPdf } from '../utils/exportReport';

const { width } = Dimensions.get('window');

// ─── Animated Circular Score ──────────────────────────────────────────────────
const AnimatedScore = ({ score, color }: { score: number; color: string }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;
    const [displayScore, setDisplayScore] = useState(0);

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: score,
            duration: 1500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
        }).start();

        const listener = animatedValue.addListener(({ value }) => {
            setDisplayScore(Math.round(value));
        });

        return () => animatedValue.removeListener(listener);
    }, [score]);

    const pct = Math.min(100, Math.max(0, displayScore));

    if (Platform.OS === 'web') {
        return (
            <View style={styles.scoreGlass}>
                <View
                    style={[
                        styles.scoreOuter,
                        { background: `conic-gradient(${color} ${pct}%, ${COLORS.border}40 0%)` } as any
                    ]}
                >
                    <View style={styles.scoreInner}>
                        <Text style={[styles.scoreNumber, { color }]}>{displayScore}</Text>
                        <Text style={styles.scorePercent}>%</Text>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.scoreNativeFallback}>
            <View style={[styles.scoreOuterNative, { borderColor: color }]}>
                <Text style={[styles.scoreNumber, { color }]}>{displayScore}</Text>
                <Text style={styles.scorePercent}>%</Text>
            </View>
        </View>
    );
};

// ─── Skill Tag Component ──────────────────────────────────────────────────────
const SkillTag = ({ name, matched }: { name: string; matched: boolean }) => (
    <View style={[styles.skillTag, matched ? styles.matchedTag : styles.missingTag]}>
        <MaterialCommunityIcons
            name={matched ? "check-circle" : "alert-circle-outline"}
            size={14}
            color={matched ? COLORS.primary : COLORS.textSecondary}
        />
        <Text style={[styles.skillTagText, matched ? styles.matchedTagText : styles.missingTagText]}>
            {name}
        </Text>
    </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ATSReportScreen({ navigation, route }: any) {
    const { results } = route.params || {};
    const [viewMode, setViewMode] = useState<'overview' | 'resume'>('overview');

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateYAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(translateYAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    if (!results) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Feather name="alert-triangle" size={48} color={COLORS.textSecondary} />
                <Text style={[TYPOGRAPHY.h3, { marginTop: 16 }]}>Analysis Unavailable</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backCta}>
                    <Text style={styles.backCtaText}>Back to Checker</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const suggestions = results.suggestions?.suggestions || [];
    const matchedKeywords = results.keywords?.matched || [];
    const missingKeywords = results.keywords?.missing || [];
    const matchedHard = results.keywords?.matchedHard || [];
    const matchedSoft = results.keywords?.matchedSoft || [];
    // Keyword suggestions (from KW-001 / KW-002 suggestion payloads)
    const keywordSuggestions = suggestions.find((s: any) => s.keywords && s.keywords.length > 0);

    // Simulate industry benchmark
    const benchmarkScore = 72;

    const MetricCard = ({ label, score, icon, description }: any) => (
        <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
                <View style={[styles.metricIconBox, { backgroundColor: COLORS.primary + '08' }]}>
                    <MaterialCommunityIcons name={icon} size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.metricScore}>{Math.round(score)}%</Text>
            </View>
            <Text style={styles.metricLabel}>{label}</Text>
            <Text style={styles.metricDesc}>{description}</Text>
        </View>
    );

    return (
        <SafeAreaView style={globalStyles.safeArea}>
            {/* Header */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="arrow-left" size={20} color={COLORS.secondary} />
                </TouchableOpacity>
                <Text style={styles.topBarTitle}>ATS INTELLIGENCE</Text>
                <TouchableOpacity style={styles.exportButton} onPress={() => exportAsPdf(results)}>
                    <Feather name="download" size={18} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={globalStyles.container}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                <Animated.View style={[
                    globalStyles.webContentWrapper,
                    { opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }
                ]}>
                    <View style={globalStyles.content}>

                        {/* ── Soft Glass Hero ─────────────────────────────────── */}
                        <View style={styles.heroSection}>
                            <View style={styles.scoreArea}>
                                <AnimatedScore score={results.overallScore} color={results.color || COLORS.primary} />
                                <View style={styles.benchMarkRow}>
                                    <Text style={styles.benchLabel}>INDUSTRY AVG: {benchmarkScore}%</Text>
                                    <View style={styles.benchTrack}>
                                        <View style={[styles.benchFill, { width: `${benchmarkScore}%` }]} />
                                    </View>
                                </View>
                            </View>

                            <View style={styles.summaryArea}>
                                <View style={styles.aiBadge}>
                                    <MaterialCommunityIcons name="auto-fix" size={14} color={COLORS.primary} />
                                    <Text style={styles.aiBadgeText}>AI SYNTHESIS</Text>
                                </View>
                                <Text style={styles.heroTitle}>Strategic Analysis</Text>
                                <Text style={styles.summaryText}>
                                    Your resume exhibits strong <Text style={styles.highlightText}>structural integrity</Text> but requires optimization in <Text style={styles.highlightText}>domain-specific terminology</Text> to bypass advanced semantic filters.
                                </Text>

                                <View style={styles.quickStatRow}>
                                    <View style={styles.statBox}>
                                        <Text style={styles.statVal}>{matchedKeywords.length}</Text>
                                        <Text style={styles.statLab}>{results.hasJd ? 'Skill Matches' : 'Technical Competencies'}</Text>
                                    </View>
                                    <View style={styles.divider} />
                                    <View style={styles.statBox}>
                                        <Text style={styles.statVal}>{suggestions.length}</Text>
                                        <Text style={styles.statLab}>Action Items</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* ── Sub Navigation ──────────────────────────────────── */}
                        <View style={styles.tabWrapper}>
                            <TouchableOpacity
                                style={[styles.navTab, viewMode === 'overview' && styles.activeNavTab]}
                                onPress={() => setViewMode('overview')}
                            >
                                <Text style={[styles.navTabText, viewMode === 'overview' && styles.activeNavTabText]}>PERFORMANCE</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.navTab, viewMode === 'resume' && styles.activeNavTab]}
                                onPress={() => setViewMode('resume')}
                            >
                                <Text style={[styles.navTabText, viewMode === 'resume' && styles.activeNavTabText]}>RESUME VIEW</Text>
                            </TouchableOpacity>
                        </View>

                        {viewMode === 'overview' ? (
                            <View>
                                {/* ── Soft Metrics Grid ────────────────────────────────── */}
                                <View style={styles.metricsGrid}>
                                    <MetricCard
                                        label={results.hasJd ? "JD Match" : "Market Strength"}
                                        score={results.breakdown?.keyword?.score || 0}
                                        icon="database-check"
                                        description={results.hasJd ? "Alignment with job requirements." : "Core technical proficiency score."}
                                    />
                                    <MetricCard
                                        label="Structure"
                                        score={results.breakdown?.formatting?.score || 0}
                                        icon="file-tree"
                                        description="ATS readability and section parsing."
                                    />
                                    <MetricCard
                                        label="Impact"
                                        score={results.breakdown?.readability?.score || 0}
                                        icon="lightning-bolt"
                                        description="Measure of achievement quantification."
                                    />
                                </View>

                                {/* ── Competency Mapping (Split Hard/Soft) ────────────── */}
                                <View style={styles.skillGapSection}>
                                    <View style={styles.sectionHeaderRow}>
                                        <Text style={styles.sectionTitle}>Competency Mapping</Text>
                                        <TouchableOpacity
                                            style={styles.copyBtn}
                                            onPress={() => {
                                                const text = matchedKeywords.join(', ');
                                                if (Platform.OS === 'web') { navigator.clipboard?.writeText(text); }
                                                else { Clipboard.setString(text); }
                                            }}
                                        >
                                            <Feather name="copy" size={12} color={COLORS.primary} />
                                            <Text style={styles.copyBtnText}>Copy All</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* Hard Skills */}
                                    {(matchedHard.length > 0 || (!results.hasJd && matchedKeywords.length > 0)) && (
                                        <View style={{ marginBottom: 12 }}>
                                            <Text style={styles.skillSubLabel}>⚙️ Technical Skills</Text>
                                            <View style={styles.tagCloud}>
                                                {(matchedHard.length > 0 ? matchedHard : matchedKeywords).slice(0, 16).map((kw: string, i: number) => (
                                                    <SkillTag key={`hard-${i}`} name={kw} matched={true} />
                                                ))}
                                            </View>
                                        </View>
                                    )}

                                    {/* Soft Skills */}
                                    {matchedSoft.length > 0 && (
                                        <View style={{ marginBottom: 12 }}>
                                            <Text style={styles.skillSubLabel}>🤝 Soft Skills</Text>
                                            <View style={styles.tagCloud}>
                                                {matchedSoft.slice(0, 10).map((kw: string, i: number) => (
                                                    <View key={`soft-${i}`} style={[styles.skillTag, { backgroundColor: '#10b98110', borderColor: '#10b98140' }]}>
                                                        <Text style={[styles.skillTagText, { color: '#10b981' }]}>{kw}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    )}

                                    {/* JD Missing Keywords */}
                                    {results.hasJd && missingKeywords.length > 0 && (
                                        <View>
                                            <Text style={styles.skillSubLabel}>❌ Missing from JD</Text>
                                            <View style={styles.tagCloud}>
                                                {missingKeywords.slice(0, 8).map((kw: string, i: number) => (
                                                    <SkillTag key={`miss-${i}`} name={kw} matched={false} />
                                                ))}
                                            </View>
                                        </View>
                                    )}
                                </View>

                                {/* ── Tailored Keyword Suggestions (JD mode only) ───────── */}
                                {results.hasJd && keywordSuggestions && keywordSuggestions.keywords && keywordSuggestions.keywords.length > 0 && (
                                    <View style={styles.skillGapSection}>
                                        <View style={styles.sectionHeaderRow}>
                                            <Text style={styles.sectionTitle}>Keywords to Add</Text>
                                            <View style={[styles.miniBadge, { backgroundColor: COLORS.error + '15' }]}>
                                                <Text style={[styles.miniBadgeText, { color: COLORS.error }]}>MISSING</Text>
                                            </View>
                                        </View>
                                        <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 10 }}>
                                            Tap a keyword to copy it, then add it naturally into your resume:
                                        </Text>
                                        <View style={styles.tagCloud}>
                                            {keywordSuggestions.keywords.map((kw: string, i: number) => (
                                                <TouchableOpacity
                                                    key={`kwtip-${i}`}
                                                    onPress={() => {
                                                        if (Platform.OS === 'web') { navigator.clipboard?.writeText(kw); }
                                                        else { Clipboard.setString(kw); }
                                                    }}
                                                >
                                                    <View style={[styles.skillTag, { backgroundColor: COLORS.error + '10', borderColor: COLORS.error + '40', flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                                                        <Feather name="plus" size={10} color={COLORS.error} />
                                                        <Text style={[styles.skillTagText, { color: COLORS.error }]}>{kw}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                )}

                                {/* ── Priority Optimizations ──────────────────────────── */}
                                <View style={styles.actionSection}>
                                    <Text style={styles.sectionTitle}>Priority Optimizations</Text>
                                    {suggestions.map((sug: any, i: number) => (
                                        <View key={i} style={styles.suggestionTile}>
                                            <View style={[styles.priorityLine, { backgroundColor: sug.priority === 'HIGH' ? COLORS.error : COLORS.warning }]} />
                                            <View style={styles.suggestionContent}>
                                                <View style={styles.suggestionHeader}>
                                                    <Text style={styles.suggestionTitle}>{sug.title}</Text>
                                                    <View style={[styles.miniBadge, { backgroundColor: (sug.priority === 'HIGH' ? COLORS.error : COLORS.warning) + '10' }]}>
                                                        <Text style={[styles.miniBadgeText, { color: sug.priority === 'HIGH' ? COLORS.error : COLORS.warning }]}>
                                                            {sug.priority}
                                                        </Text>
                                                    </View>
                                                </View>
                                                <Text style={styles.suggestionMessage}>{sug.message}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>

                                {/* ── Global CTA ─────────────────────────────────────── */}
                                <TouchableOpacity
                                    style={styles.fixCta}
                                    onPress={() => navigation.navigate('ResumeBuilder')}
                                >
                                    <Text style={styles.fixCtaText}>OPTIMIZE IN BUILDER</Text>
                                    <Feather name="chevron-right" size={16} color={COLORS.surface} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            /* ── Interactive Insight ────────────────────────────────── */
                            <View style={styles.insightBox}>
                                <View style={styles.insightLegend}>
                                    <View style={styles.legendItem}>
                                        <View style={[styles.dot, { backgroundColor: COLORS.error }]} />
                                        <Text style={styles.legendTxt}>WEAK POINT</Text>
                                    </View>
                                    <View style={styles.legendItem}>
                                        <View style={[styles.dot, { backgroundColor: COLORS.primary }]} />
                                        <Text style={styles.legendTxt}>KEYWORD MATCH</Text>
                                    </View>
                                </View>
                                <AtsHighlightView text={results.extractedText} matchedKeywords={matchedKeywords} />
                            </View>
                        )}
                    </View>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    topBar: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        backgroundColor: COLORS.surface,
    },
    topBarTitle: {
        fontSize: 12,
        fontWeight: '800',
        color: COLORS.secondary,
        letterSpacing: 2,
    },
    backButton: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    exportButton: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // ── Hero / Soft Glass ────────────────────────────────────────────────────────
    heroSection: {
        flexDirection: width > 800 ? 'row' : 'column',
        paddingVertical: SPACING.xxl,
        gap: SPACING.xl,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border + '40',
        marginBottom: SPACING.xl,
    },
    scoreArea: {
        alignItems: 'center',
        width: width > 800 ? 180 : '100%',
    },
    summaryArea: {
        flex: 1,
    },
    aiBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: COLORS.primaryLight,
        borderRadius: 4,
        alignSelf: 'flex-start',
        gap: 6,
        marginBottom: 12,
    },
    aiBadgeText: {
        fontSize: 10,
        fontWeight: '900',
        color: COLORS.primary,
        letterSpacing: 0.5,
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: COLORS.secondary,
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    summaryText: {
        fontSize: 16,
        color: COLORS.text,
        lineHeight: 26,
        fontWeight: '400',
        opacity: 0.9,
    },
    highlightText: {
        fontWeight: '600',
        color: COLORS.primary,
    },
    quickStatRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.xl,
        gap: SPACING.xl,
    },
    statBox: {
        alignItems: 'flex-start',
    },
    statVal: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.secondary,
    },
    statLab: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    divider: {
        width: 1,
        height: 30,
        backgroundColor: COLORS.border,
    },
    // ── Industry Benchmark ──────────────────────────────────────────────────────
    benchMarkRow: {
        width: 140,
        marginTop: 16,
    },
    benchLabel: {
        fontSize: 9,
        fontWeight: '800',
        color: COLORS.textSecondary,
        marginBottom: 4,
        textAlign: 'center',
    },
    benchTrack: {
        height: 3,
        backgroundColor: COLORS.border + '40',
        borderRadius: 2,
    },
    benchFill: {
        height: '100%',
        backgroundColor: COLORS.textSecondary,
        borderRadius: 2,
        opacity: 0.5,
    },
    // ── Animated Score ──────────────────────────────────────────────────────────
    scoreGlass: {
        width: 154,
        height: 154,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scoreOuter: {
        width: 140,
        height: 140,
        borderRadius: 70,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scoreInner: {
        width: 130,
        height: 130,
        borderRadius: 65,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    scoreNumber: {
        fontSize: 44,
        fontWeight: '800',
        letterSpacing: -1,
    },
    scorePercent: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginTop: 12,
        marginLeft: 2,
    },
    scoreNativeFallback: {
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scoreOuterNative: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    // ── Secondary Tabs ──────────────────────────────────────────────────────────
    tabWrapper: {
        flexDirection: 'row',
        marginBottom: SPACING.xl,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border + '40',
    },
    navTab: {
        marginRight: SPACING.xl,
        paddingVertical: 12,
    },
    activeNavTab: {
        borderBottomWidth: 2,
        borderBottomColor: COLORS.primary,
    },
    navTabText: {
        fontSize: 12,
        fontWeight: '800',
        color: COLORS.textSecondary,
        letterSpacing: 1,
    },
    activeNavTabText: {
        color: COLORS.primary,
    },
    // ── Soft Metrics ────────────────────────────────────────────────────────────
    metricsGrid: {
        flexDirection: width > 800 ? 'row' : 'column',
        gap: SPACING.xl,
        marginBottom: SPACING.xxl,
    },
    metricCard: {
        flex: 1,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: SPACING.xl,
        borderWidth: 1,
        borderColor: COLORS.border + '60',
        ...SHADOWS.small,
    },
    metricHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    metricIconBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    metricScore: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.secondary,
    },
    metricLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.secondary,
        marginBottom: 6,
    },
    metricDesc: {
        fontSize: 13,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    // ── Competency Mapping ──────────────────────────────────────────────────────
    skillGapSection: {
        marginBottom: SPACING.xxl,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.secondary,
    },
    copyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 4,
        backgroundColor: COLORS.primaryLight,
    },
    copyBtnText: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.primary,
    },
    tagCloud: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    skillTag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: ROUNDING.md,
        borderWidth: 1,
        gap: 8,
    },
    matchedTag: {
        backgroundColor: COLORS.surface,
        borderColor: COLORS.primary + '30',
    },
    missingTag: {
        backgroundColor: COLORS.surface,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
    },
    skillTagText: {
        fontSize: 12,
        fontWeight: '600',
    },
    matchedTagText: {
        color: COLORS.primary,
    },
    missingTagText: {
        color: COLORS.textSecondary,
    },
    // ── Suggestions ─────────────────────────────────────────────────────────────
    actionSection: {
        marginBottom: SPACING.xl,
    },
    suggestionTile: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderRadius: ROUNDING.lg,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border + '60',
        overflow: 'hidden',
        ...SHADOWS.small,
    },
    priorityLine: {
        width: 5,
    },
    suggestionContent: {
        flex: 1,
        padding: SPACING.lg,
    },
    suggestionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    suggestionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.secondary,
    },
    suggestionMessage: {
        fontSize: 13,
        color: COLORS.text,
        lineHeight: 20,
    },
    miniBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    miniBadgeText: {
        fontSize: 9,
        fontWeight: '800',
    },
    // ── Final CTA ──────────────────────────────────────────────────────────────
    fixCta: {
        backgroundColor: COLORS.secondary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 12,
        gap: 12,
        marginTop: SPACING.lg,
    },
    fixCtaText: {
        color: COLORS.surface,
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 1,
    },
    // ── Insight Legend ──────────────────────────────────────────────────────────
    insightBox: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border + '60',
        overflow: 'hidden',
    },
    insightLegend: {
        flexDirection: 'row',
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border + '40',
        gap: SPACING.xxl,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    legendTxt: {
        fontSize: 10,
        fontWeight: '800',
        color: COLORS.textSecondary,
        letterSpacing: 0.5,
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.background,
    },
    backCta: {
        marginTop: 24,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: COLORS.primary,
        borderRadius: ROUNDING.md,
    },
    backCtaText: {
        color: COLORS.surface,
        fontWeight: '700',
    },
    emptyCard: {
        padding: SPACING.xl,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    skillSubLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 8,
        marginTop: 4,
    },
});
