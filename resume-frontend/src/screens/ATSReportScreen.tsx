import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, StyleSheet, Platform, Animated } from 'react-native';
import { globalStyles, TYPOGRAPHY, COLORS, SPACING, ROUNDING, SHADOWS } from '../styles/theme';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AtsHighlightView from '../components/AtsHighlightView';

const ScorePieChart = ({ score, color }: { score: number; color: string }) => {
    const pct = Math.min(100, Math.max(0, Math.round(score)));

    if (Platform.OS === 'web') {
        return (
            <View style={styles.chartOuter}>
                <View
                    style={[
                        styles.chartContainer,
                        {
                            background: `conic-gradient(${color} ${pct}%, ${COLORS.border} 0%)`,
                        } as any
                    ]}
                >
                    <View style={styles.chartInner}>
                        <Text style={styles.chartScore}>{pct}</Text>
                        <Text style={styles.chartPct}>%</Text>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.chartContainer, { width: 120, height: 120, borderRadius: 60, borderWidth: 8, borderColor: color }]}>
            <View style={styles.chartInner}>
                <Text style={styles.chartScore}>{pct}</Text>
                <Text style={styles.chartPct}>%</Text>
            </View>
        </View>
    );
};

export default function ATSReportScreen({ navigation, route }: any) {
    const { results } = route.params || {};
    const [viewMode, setViewMode] = useState<'overview' | 'resume'>('overview');

    if (!results) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Text style={TYPOGRAPHY.body1}>No analysis data found.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={{ color: COLORS.accent, marginTop: 20, fontWeight: '600' }}>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const suggestions = results.suggestions?.suggestions || [];
    const matchedKeywords = results.keywords?.matched || [];

    const CategoryCard = ({ label, value, icon, color }: any) => (
        <View style={styles.breakdownCard}>
            <View style={[styles.iconFrame, { backgroundColor: color + '08' }]}>
                <MaterialCommunityIcons name={icon} size={20} color={color} />
            </View>
            <View style={{ flex: 1, marginLeft: SPACING.md }}>
                <Text style={styles.breakdownLabel}>{label}</Text>
                <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { width: `${value}%`, backgroundColor: color }]} />
                </View>
            </View>
            <Text style={[styles.breakdownValue, { color: COLORS.primary }]}>{Math.round(value)}%</Text>
        </View>
    );

    return (
        <SafeAreaView style={globalStyles.safeArea}>
            {/* Header */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="chevron-left" size={24} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={[TYPOGRAPHY.h3, { fontWeight: '700' }]}>ATS Intelligence Report</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={globalStyles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ backgroundColor: COLORS.background }}>
                <View style={globalStyles.webContentWrapper}>
                    <View style={globalStyles.content}>

                        {/* Hero Score Section */}
                        <View style={styles.heroSection}>
                            <ScorePieChart score={results.overallScore} color={results.color || COLORS.primary} />
                            <View style={styles.heroTextContainer}>
                                <Text style={[TYPOGRAPHY.h4, { color: results.color || COLORS.primary, marginBottom: 4 }]}>{results.label}</Text>
                                <Text style={[TYPOGRAPHY.h1, { fontSize: 32, marginBottom: 8 }]}>Resume Match Score</Text>
                                <Text style={[TYPOGRAPHY.body2, { maxWidth: 400 }]}>
                                    A professional assessment of your document's compatibility with the targeted role.
                                </Text>
                            </View>
                        </View>

                        {/* Navigation Tabs */}
                        <View style={styles.tabContainer}>
                            <View style={styles.tabBar}>
                                <TouchableOpacity
                                    style={[styles.tab, viewMode === 'overview' && styles.activeTab]}
                                    onPress={() => setViewMode('overview')}
                                >
                                    <Text style={[styles.tabText, viewMode === 'overview' && styles.activeTabText]}>Overview</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.tab, viewMode === 'resume' && styles.activeTab]}
                                    onPress={() => setViewMode('resume')}
                                >
                                    <Text style={[styles.tabText, viewMode === 'resume' && styles.activeTabText]}>Resume Insight</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {viewMode === 'overview' ? (
                            <View>
                                {/* Core Breakdown */}
                                <Text style={[styles.sectionHeader]}>Performance Metrics</Text>
                                <View style={styles.gridContainer}>
                                    <CategoryCard
                                        label="Keyword Relevance"
                                        value={results.breakdown?.keyword?.score || 0}
                                        icon="file-search-outline"
                                        color={COLORS.accent}
                                    />
                                    <CategoryCard
                                        label="Structural Integrity"
                                        value={results.breakdown?.formatting?.score || 0}
                                        icon="format-list-bulleted"
                                        color="#64748B"
                                    />
                                    <CategoryCard
                                        label="Language Impact"
                                        value={results.breakdown?.readability?.score || 0}
                                        icon="flash-outline"
                                        color="#10B981"
                                    />
                                </View>

                                {/* Action Items */}
                                <Text style={styles.sectionHeader}>Priority Improvements</Text>
                                {suggestions.length > 0 ? (
                                    <View style={{ gap: SPACING.md }}>
                                        {suggestions.map((sug: any, index: number) => (
                                            <View key={index} style={styles.sugCard}>
                                                <View style={[styles.sugIndicator, { backgroundColor: sug.priority === 'HIGH' ? COLORS.error : COLORS.warning }]} />
                                                <View style={{ flex: 1, paddingLeft: SPACING.md }}>
                                                    <View style={styles.sugHeader}>
                                                        <Text style={styles.sugTitle}>{sug.title}</Text>
                                                        <Text style={[styles.sugCategory, { color: sug.priority === 'HIGH' ? COLORS.error : COLORS.warning }]}>{sug.priority}</Text>
                                                    </View>
                                                    <Text style={styles.sugMessage}>{sug.message}</Text>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                ) : (
                                    <View style={styles.emptyState}>
                                        <MaterialCommunityIcons name="check-decagram-outline" size={32} color={COLORS.success} />
                                        <Text style={[TYPOGRAPHY.h3, { marginTop: SPACING.md, fontWeight: '600' }]}>Excellence Achieved</Text>
                                        <Text style={TYPOGRAPHY.body2}>No critical structural or semantic issues detected.</Text>
                                    </View>
                                )}
                            </View>
                        ) : (
                            <View style={styles.resumeViewContainer}>
                                <View style={styles.resumeHeader}>
                                    <View style={styles.legendItem}>
                                        <View style={[styles.legendDot, { backgroundColor: COLORS.error }]} />
                                        <Text style={styles.legendText}>Potential Weakness</Text>
                                    </View>
                                    <View style={styles.legendItem}>
                                        <View style={[styles.legendDot, { backgroundColor: COLORS.success }]} />
                                        <Text style={styles.legendText}>Matched Keywords</Text>
                                    </View>
                                </View>

                                <View style={styles.highlighterWrapper}>
                                    <AtsHighlightView
                                        text={results.extractedText}
                                        matchedKeywords={matchedKeywords}
                                    />
                                </View>
                            </View>
                        )}

                        <View style={{ height: 120 }} />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    topBar: {
        height: 64,
        backgroundColor: COLORS.surface,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroSection: {
        flexDirection: Platform.OS === 'web' ? 'row' : 'column' as any,
        alignItems: 'center',
        paddingVertical: SPACING.xl,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        marginBottom: SPACING.lg,
    },
    heroTextContainer: {
        flex: 1,
        marginLeft: Platform.OS === 'web' ? SPACING.xl : 0,
        marginTop: Platform.OS === 'web' ? 0 : SPACING.lg,
        alignItems: Platform.OS === 'web' ? 'flex-start' : 'center',
        textAlign: Platform.OS === 'web' ? 'left' : 'center' as any,
    },
    chartOuter: {
        padding: 6,
        borderRadius: 100,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    chartContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chartInner: {
        width: 104,
        height: 104,
        borderRadius: 52,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    chartScore: {
        fontSize: 28,
        fontWeight: '700',
        color: COLORS.primary,
    },
    chartPct: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginTop: 4,
        marginLeft: 1,
    },
    tabContainer: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: COLORS.primaryLight,
        padding: 4,
        borderRadius: ROUNDING.sm,
        width: Platform.OS === 'web' ? 320 : '100%',
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: ROUNDING.sm - 2,
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: COLORS.surface,
        ...SHADOWS.card,
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    activeTabText: {
        color: COLORS.primary,
    },
    sectionHeader: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: SPACING.lg,
    },
    gridContainer: {
        flexDirection: Platform.OS === 'web' ? 'row' : 'column' as any,
        gap: SPACING.md,
        marginBottom: SPACING.xl,
    },
    breakdownCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: ROUNDING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    iconFrame: {
        width: 36,
        height: 36,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    breakdownLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 6,
    },
    progressContainer: {
        height: 4,
        backgroundColor: COLORS.primaryLight,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 2,
    },
    breakdownValue: {
        fontSize: 16,
        fontWeight: '700',
        marginLeft: SPACING.md,
    },
    sugCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderRadius: ROUNDING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: SPACING.md,
        paddingLeft: 0,
        overflow: 'hidden',
    },
    sugIndicator: {
        width: 4,
        height: '100%',
    },
    sugHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    sugTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
    },
    sugCategory: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    sugMessage: {
        fontSize: 13,
        color: COLORS.text,
        lineHeight: 20,
    },
    resumeViewContainer: {
        backgroundColor: COLORS.surface,
        borderRadius: ROUNDING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    resumeHeader: {
        flexDirection: 'row',
        padding: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        gap: SPACING.lg,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    highlighterWrapper: {
        minHeight: 500,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 64,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
        borderRadius: ROUNDING.md,
    }
});
