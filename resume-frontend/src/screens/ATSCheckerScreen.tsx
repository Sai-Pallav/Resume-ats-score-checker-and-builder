import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, TextInput, ScrollView, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { globalStyles, TYPOGRAPHY, COLORS, SPACING, ROUNDING, SHADOWS } from '../styles/theme';
import { api } from '../services/api';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const ScorePieChart = ({ score, color }: { score: number; color: string }) => {
    const pct = Math.min(100, Math.max(0, Math.round(score)));
    if (Platform.OS === 'web') {
        return (
            <View
                style={[
                    styles.chartContainer,
                    {
                        width: 120,
                        height: 120,
                        borderRadius: 60,
                        background: `conic-gradient(${color} ${pct}%, ${COLORS.border} 0%)`,
                    } as any
                ]}
            >
                <View style={styles.chartInner}>
                    <Text style={styles.chartScore}>{pct}</Text>
                    <Text style={styles.chartPct}>%</Text>
                </View>
            </View>
        );
    }
    // Native fallback: plain circle
    return (
        <View style={[styles.chartContainer, { width: 120, height: 120, borderRadius: 60, borderWidth: 10, borderColor: color }]}>
            <View style={styles.chartInner}>
                <Text style={styles.chartScore}>{pct}</Text>
                <Text style={styles.chartPct}>%</Text>
            </View>
        </View>
    );
};

export default function ATSCheckerScreen({ navigation }: any) {
    const [file, setFile] = useState<any>(null);
    const [jobDescription, setJobDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'upload' | 'results'>('upload');
    const [showHighlighter, setShowHighlighter] = useState(false);

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
            });
            if (!result.canceled) {
                setFile(result.assets[0]);
                setError(null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const analyzeResume = async () => {
        if (!file) {
            setError('Please select a PDF resume first.');
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        if (Platform.OS === 'web' && file.file) {
            formData.append('file', file.file);
        } else {
            formData.append('file', {
                uri: file.uri,
                name: file.name,
                type: file.mimeType || 'application/pdf',
            } as any);
        }

        if (jobDescription.trim()) {
            formData.append('jobDescription', jobDescription.trim());
        }

        try {
            const res = await api.post('/ats/analyze', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setResults(res.data.data);
            navigation.navigate('ATSReport', { results: res.data.data });
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to analyze resume. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderHighlighter = () => {
        if (!results || !results.extractedText) return null;

        const text = results.extractedText;
        const lines = text.split('\n');

        const commonWeakWords = ['responsible for', 'helped with', 'duties included', 'worked on'];

        return (
            <View style={styles.highlighterContainer}>
                {lines.map((line: string, i: number) => {
                    const isWeak = line.trim().length > 20 && (
                        !/\d/.test(line) ||
                        commonWeakWords.some(w => line.toLowerCase().includes(w))
                    );

                    return (
                        <Text key={i} style={[
                            styles.resumeLine,
                            isWeak ? styles.weakLine : null
                        ]}>
                            {line}
                        </Text>
                    );
                })}
            </View>
        );
    };

    if (viewMode === 'results' && results) {
        const suggestions = results.suggestions?.suggestions || [];

        return (
            <SafeAreaView style={globalStyles.safeArea}>
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={() => setViewMode('upload')} style={styles.backButton}>
                        <Feather name="arrow-left" size={20} color={COLORS.primary} />
                        <Text style={{ color: COLORS.secondary, fontWeight: '600' }}>New Analysis</Text>
                    </TouchableOpacity>
                    <Text style={TYPOGRAPHY.h3}>Analysis Results</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView style={globalStyles.container} showsVerticalScrollIndicator={false}>
                    <View style={globalStyles.webContentWrapper}>
                        <View style={globalStyles.content}>

                            <View style={styles.finalScoreCard}>
                                <ScorePieChart score={results.overallScore} color={results.color || COLORS.primary} />
                                <View style={{ marginLeft: SPACING.xl, flex: 1 }}>
                                    <View style={[styles.badge, { backgroundColor: (results.color || COLORS.primary) + '20' }]}>
                                        <Text style={{ color: results.color || COLORS.primary, fontWeight: '700', fontSize: 12 }}>{results.label}</Text>
                                    </View>
                                    <Text style={[TYPOGRAPHY.h1, { marginTop: SPACING.xs }]}>ATS Score</Text>
                                    <Text style={TYPOGRAPHY.body2}>Your resume match score for this position.</Text>
                                </View>
                            </View>

                            <View style={styles.tabContainer}>
                                <TouchableOpacity
                                    style={[styles.tab, !showHighlighter && styles.activeTab]}
                                    onPress={() => setShowHighlighter(false)}
                                >
                                    <Text style={[styles.tabText, !showHighlighter && styles.activeTabText]}>Recommendations</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.tab, showHighlighter && styles.activeTab]}
                                    onPress={() => setShowHighlighter(true)}
                                >
                                    <Text style={[styles.tabText, showHighlighter && styles.activeTabText]}>Resume View</Text>
                                </TouchableOpacity>
                            </View>

                            {!showHighlighter ? (
                                <>
                                    <View style={styles.breakdownRow}>
                                        {[
                                            { label: 'Keywords', val: results.breakdown?.keyword?.score, icon: 'tag-outline' },
                                            { label: 'Foundations', val: results.breakdown?.formatting?.score, icon: 'file-check-outline' },
                                            { label: 'Impact', val: results.breakdown?.readability?.score, icon: 'trending-up' }
                                        ].map((item, idx) => (
                                            <View key={idx} style={styles.breakdownItem}>
                                                <MaterialCommunityIcons name={item.icon as any} size={18} color={COLORS.textSecondary} />
                                                <Text style={styles.breakdownValue}>{Math.round(item.val || 0)}</Text>
                                                <Text style={styles.breakdownLabel}>{item.label}</Text>
                                            </View>
                                        ))}
                                    </View>

                                    <Text style={[TYPOGRAPHY.h2, { marginBottom: SPACING.lg }]}>Optimization Tips</Text>
                                    {suggestions.length > 0 ? (
                                        suggestions.map((sug: any, index: number) => (
                                            <View key={index} style={styles.suggestionCard}>
                                                <View style={[styles.priorityIndicator, { backgroundColor: sug.priority === 'HIGH' ? COLORS.error : COLORS.warning }]} />
                                                <View style={{ flex: 1, padding: SPACING.lg }}>
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                                        <Text style={[TYPOGRAPHY.h3, { marginBottom: 0 }]}>{sug.title}</Text>
                                                        <View style={[styles.priorityBadge, { backgroundColor: (sug.priority === 'HIGH' ? COLORS.error : COLORS.warning) + '15' }]}>
                                                            <Text style={{ fontSize: 10, fontWeight: '800', color: sug.priority === 'HIGH' ? COLORS.error : COLORS.warning }}>{sug.priority}</Text>
                                                        </View>
                                                    </View>
                                                    <Text style={TYPOGRAPHY.body2}>{sug.message}</Text>
                                                </View>
                                            </View>
                                        ))
                                    ) : (
                                        <View style={styles.emptyState}>
                                            <MaterialCommunityIcons name="check-decagram" size={48} color={COLORS.success} />
                                            <Text style={[TYPOGRAPHY.h3, { marginTop: SPACING.md }]}>Excellent Work!</Text>
                                            <Text style={TYPOGRAPHY.body2}>We found no critical issues with your resume.</Text>
                                        </View>
                                    )}
                                </>
                            ) : (
                                <View style={styles.resumeViewBox}>
                                    <View style={styles.resumeHeader}>
                                        <Feather name="info" size={14} color={COLORS.primary} />
                                        <Text style={{ marginLeft: 6, fontSize: 13, color: COLORS.textSecondary }}>
                                            Red underlines indicate sentences that could be strengthened.
                                        </Text>
                                    </View>
                                    {renderHighlighter()}
                                </View>
                            )}

                            <View style={{ height: 100 }} />
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={globalStyles.safeArea}>
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="chevron-left" size={24} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={[TYPOGRAPHY.h3, { fontWeight: '700' }]}>ATS Engine</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={globalStyles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ backgroundColor: COLORS.background }}>
                <View style={globalStyles.webContentWrapper}>
                    <View style={globalStyles.content}>

                        <View style={styles.heroSection}>
                            <Text style={[TYPOGRAPHY.h1, { textAlign: 'center' }]}>Resume Optimization</Text>
                            <Text style={[TYPOGRAPHY.body1, { textAlign: 'center', color: COLORS.text, maxWidth: 500 }]}>
                                Align your professional history with specific role requirements using our diagnostic engine.
                            </Text>
                        </View>

                        <View style={styles.uploadCard}>
                            <TouchableOpacity
                                style={[styles.dropZone, file ? styles.dropZoneActive : null]}
                                onPress={pickDocument}
                                activeOpacity={0.7}
                            >
                                <View style={styles.uploadCircle}>
                                    <Feather
                                        name={file ? "check" : "upload"}
                                        size={24}
                                        color={file ? COLORS.success : COLORS.primary}
                                    />
                                </View>
                                <Text style={[TYPOGRAPHY.h3, { marginTop: SPACING.lg, textAlign: 'center', fontWeight: '600' }]}>
                                    {file ? file.name : 'Upload PDF Resume'}
                                </Text>
                                <Text style={[TYPOGRAPHY.body2, { marginTop: 4, color: COLORS.textSecondary }]}>
                                    {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Select your latest resume file'}
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.inputGroup}>
                                <Text style={[TYPOGRAPHY.label]}>Target Job Description</Text>
                                <TextInput
                                    style={[globalStyles.inputBase, { height: 200, textAlignVertical: 'top', backgroundColor: COLORS.primaryLight + '30' }]}
                                    placeholder="Paste the requirements here to enable keyword gap analysis..."
                                    placeholderTextColor={COLORS.textSecondary}
                                    multiline
                                    value={jobDescription}
                                    onChangeText={setJobDescription}
                                />
                            </View>

                            {error && (
                                <View style={styles.errorBanner}>
                                    <Feather name="alert-circle" size={16} color={COLORS.error} />
                                    <Text style={styles.errorText}>{error}</Text>
                                </View>
                            )}

                            <TouchableOpacity
                                style={[styles.mainButton, (!file || loading) && styles.buttonDisabled]}
                                onPress={analyzeResume}
                                disabled={loading || !file}
                            >
                                {loading ? (
                                    <ActivityIndicator color={COLORS.surface} size="small" />
                                ) : (
                                    <Text style={styles.buttonText}>Run Diagnostic</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        <View style={{ height: 80 }} />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
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
        alignItems: 'center',
        paddingVertical: SPACING.xl,
        gap: SPACING.sm,
    },
    uploadCard: {
        backgroundColor: COLORS.surface,
        borderRadius: ROUNDING.md,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    dropZone: {
        borderWidth: 2,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
        borderRadius: ROUNDING.md,
        paddingVertical: SPACING.xl,
        alignItems: 'center',
        backgroundColor: COLORS.primaryLight + '20',
    },
    dropZoneActive: {
        borderColor: COLORS.success,
        backgroundColor: COLORS.successBg,
        borderStyle: 'solid',
    },
    uploadCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    inputGroup: {
        marginTop: SPACING.xl,
    },
    mainButton: {
        backgroundColor: COLORS.primary,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: ROUNDING.sm,
        marginTop: SPACING.xl,
    },
    buttonDisabled: {
        backgroundColor: COLORS.textSecondary,
        opacity: 0.5,
    },
    buttonText: {
        color: COLORS.surface,
        fontWeight: '700',
        fontSize: 15,
        letterSpacing: 0.5,
    },
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.errorBg,
        padding: SPACING.md,
        borderRadius: ROUNDING.sm,
        marginTop: SPACING.lg,
    },
    errorText: {
        color: COLORS.error,
        marginLeft: SPACING.sm,
        fontSize: 13,
        fontWeight: '600',
    },
    finalScoreCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: SPACING.xl,
        borderRadius: ROUNDING.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.xl,
        ...SHADOWS.card,
    },
    badge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.background,
        padding: 4,
        borderRadius: ROUNDING.lg,
        marginBottom: SPACING.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: ROUNDING.md,
    },
    activeTab: {
        backgroundColor: COLORS.surface,
        ...SHADOWS.small,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    activeTabText: {
        color: COLORS.primary,
    },
    breakdownRow: {
        flexDirection: 'row',
        gap: SPACING.lg,
        marginBottom: SPACING.xxl,
    },
    breakdownItem: {
        flex: 1,
        backgroundColor: COLORS.surface,
        padding: SPACING.lg,
        borderRadius: ROUNDING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
    },
    breakdownValue: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.secondary,
        marginTop: 6,
    },
    breakdownLabel: {
        fontSize: 11,
        color: COLORS.textSecondary,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    suggestionCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderRadius: ROUNDING.lg,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
        ...SHADOWS.small,
    },
    priorityIndicator: {
        width: 6,
    },
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    resumeViewBox: {
        backgroundColor: COLORS.surface,
        borderRadius: ROUNDING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
    },
    resumeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        padding: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    highlighterContainer: {
        padding: SPACING.xl,
    },
    resumeLine: {
        fontSize: 13,
        lineHeight: 20,
        color: COLORS.secondary,
        marginBottom: 2,
    },
    weakLine: {
        textDecorationLine: 'underline',
        textDecorationColor: COLORS.error,
        backgroundColor: COLORS.errorBg + '50',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: SPACING.xxl,
    },
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    chartInner: {
        position: 'absolute',
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    chartScore: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.secondary,
    },
    chartPct: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginTop: 6,
    },
});
