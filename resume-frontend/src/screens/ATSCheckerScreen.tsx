import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, TextInput, ScrollView, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { globalStyles, TYPOGRAPHY, COLORS, SPACING, ROUNDING, SHADOWS } from '../styles/theme';
import { api } from '../services/api';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function ATSCheckerScreen({ navigation }: any) {
    const [file, setFile] = useState<any>(null);
    const [jobDescription, setJobDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

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
        setResults(null);

        const formData = new FormData();
        if (Platform.OS === 'web' && file.file) {
            // Native browser File object
            formData.append('file', file.file);
        } else {
            // Mobile URI-based object
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
            const res = await api.post('/ats/analyze', formData);
            setResults(res.data.data);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to analyze resume. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={globalStyles.safeArea}>
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <View style={styles.backIconFrame}>
                        <Feather name="chevron-left" size={20} color={COLORS.primary} />
                    </View>
                    <Text style={{ color: COLORS.secondary, fontWeight: '600', fontSize: 14 }}>Back</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={globalStyles.container} showsVerticalScrollIndicator={false}>
                <View style={globalStyles.webContentWrapper}>
                    <View style={globalStyles.content}>

                        <View style={styles.mainHeader}>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.xs }}>
                                    <View style={styles.headerIconFrame}>
                                        <MaterialCommunityIcons name="radar" size={22} color={COLORS.primary} />
                                    </View>
                                    <Text style={TYPOGRAPHY.h1}>ATS Engine</Text>
                                </View>
                                <Text style={TYPOGRAPHY.body1}>Analyze your resume compatibility with recruiter screening patterns.</Text>
                            </View>
                        </View>

                        <View style={styles.cardContainer}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.lg }}>
                                <View style={styles.stepCircle}>
                                    <Text style={styles.stepText}>1</Text>
                                </View>
                                <Text style={TYPOGRAPHY.h3}>Select Resume</Text>
                            </View>

                            <TouchableOpacity
                                style={[styles.uploadBox, file ? styles.uploadBoxActive : null]}
                                onPress={pickDocument}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.uploadIconFrame, file ? { backgroundColor: COLORS.primaryLight } : null]}>
                                    <MaterialCommunityIcons
                                        name={file ? "file-check-outline" : "file-upload-outline"}
                                        size={28}
                                        color={file ? COLORS.primary : COLORS.textSecondary}
                                    />
                                </View>
                                <Text style={[TYPOGRAPHY.h3, { marginTop: SPACING.lg, color: file ? COLORS.primary : COLORS.secondary, fontSize: 16 }]}>
                                    {file ? file.name : 'Click to upload PDF'}
                                </Text>
                                {file ? (
                                    <Text style={[TYPOGRAPHY.body2, { marginTop: 4 }]}>{(file.size / 1024).toFixed(1)} KB</Text>
                                ) : (
                                    <Text style={[TYPOGRAPHY.body2, { marginTop: 4 }]}>PDF format only, max 5MB</Text>
                                )}
                            </TouchableOpacity>

                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginTop: SPACING.xl, marginBottom: SPACING.lg }}>
                                <View style={styles.stepCircle}>
                                    <Text style={styles.stepText}>2</Text>
                                </View>
                                <Text style={TYPOGRAPHY.h3}>Job Match <Text style={{ color: COLORS.textSecondary, fontWeight: '400', fontSize: 14 }}>(Optional)</Text></Text>
                            </View>

                            <TextInput
                                style={[globalStyles.inputBase, { height: 140, textAlignVertical: 'top' }]}
                                placeholder="Paste job description here to check keywords matching..."
                                placeholderTextColor={COLORS.textSecondary}
                                multiline
                                value={jobDescription}
                                onChangeText={setJobDescription}
                            />

                            {error && (
                                <View style={styles.errorBox}>
                                    <Feather name="alert-circle" size={18} color={COLORS.error} />
                                    <Text style={{ color: COLORS.error, marginLeft: SPACING.sm, flex: 1, fontSize: 14 }}>{error}</Text>
                                </View>
                            )}

                            <TouchableOpacity
                                style={styles.analyzeButton}
                                onPress={analyzeResume}
                                disabled={loading || !file}
                                activeOpacity={0.8}
                            >
                                {loading ? (
                                    <ActivityIndicator color={COLORS.surface} size="small" />
                                ) : (
                                    <>
                                        <Text style={styles.analyzeButtonText}>Start Analysis</Text>
                                        <Feather name="arrow-right" size={18} color={COLORS.surface} />
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>

                        {results && (
                            <View style={{ marginTop: SPACING.xxl }}>
                                <Text style={[TYPOGRAPHY.h2, { marginBottom: SPACING.lg }]}>Analysis Report</Text>

                                <View style={styles.scoreCard}>
                                    <View style={styles.scoreHeader}>
                                        <View style={styles.scoreCircle}>
                                            <Text style={styles.bigScore}>{results.overallScore.toFixed(0)}</Text>
                                            <Text style={styles.scorePercent}>%</Text>
                                        </View>
                                        <View style={{ flex: 1, marginLeft: SPACING.xl }}>
                                            <Text style={[TYPOGRAPHY.h2, { color: COLORS.surface, marginBottom: 2 }]}>Match Score</Text>
                                            <Text style={[TYPOGRAPHY.body2, { color: 'rgba(255,255,255,0.85)' }]}>
                                                {results.overallScore >= 80 ? 'Excellent profile optimization.' : 'Some improvements recommended.'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.subScoresContainer}>
                                    {[
                                        { label: 'Keywords', val: results.sectionScores.keywords, icon: 'tag-outline' },
                                        { label: 'Format', val: results.sectionScores.format, icon: 'file-document-outline' },
                                        { label: 'Content', val: results.sectionScores.readability, icon: 'eye-outline' }
                                    ].map((item, idx) => (
                                        <View key={idx} style={styles.subScoreCard}>
                                            <Text style={styles.subScoreValue}>{(item.val || 0).toFixed(0)}</Text>
                                            <Text style={[TYPOGRAPHY.label, { marginBottom: 0, fontSize: 12 }]}>{item.label}</Text>
                                        </View>
                                    ))}
                                </View>

                                {results.suggestions && results.suggestions.length > 0 && (
                                    <View style={styles.cardContainer}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.lg }}>
                                            <View style={styles.headerIconFrame}>
                                                <MaterialCommunityIcons name="lightbulb-outline" size={20} color={COLORS.primary} />
                                            </View>
                                            <Text style={TYPOGRAPHY.h3}>Optimization Tips</Text>
                                        </View>
                                        {results.suggestions.map((sug: any, index: number) => (
                                            <View key={index} style={styles.suggestionRow}>
                                                <View style={[styles.suggestionDot, { backgroundColor: sug.category === 'CRITICAL' ? COLORS.error : COLORS.warning }]} />
                                                <Text style={[TYPOGRAPHY.body1, { flex: 1, fontSize: 14 }]}>{sug.message}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        )}

                        <View style={{ height: 60 }} />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    topBar: {
        paddingHorizontal: SPACING.xl,
        paddingTop: Platform.OS === 'web' ? SPACING.lg : SPACING.xl,
        paddingBottom: SPACING.lg,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    backIconFrame: {
        width: 32,
        height: 32,
        borderRadius: ROUNDING.sm,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    mainHeader: {
        marginBottom: SPACING.xl,
    },
    headerIconFrame: {
        width: 36,
        height: 36,
        borderRadius: ROUNDING.sm,
        backgroundColor: COLORS.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardContainer: {
        backgroundColor: COLORS.surface,
        borderRadius: ROUNDING.lg,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.card,
        marginBottom: SPACING.lg,
    },
    uploadBox: {
        alignItems: 'center',
        justifyContent: 'center',
        borderStyle: 'dashed',
        borderColor: COLORS.border,
        borderWidth: 1,
        borderRadius: ROUNDING.md,
        padding: SPACING.xl,
        backgroundColor: COLORS.background,
    },
    uploadBoxActive: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primaryLight,
        borderStyle: 'solid',
    },
    uploadIconFrame: {
        width: 48,
        height: 48,
        borderRadius: ROUNDING.md,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    analyzeButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 14,
        borderRadius: ROUNDING.md,
        marginTop: SPACING.lg,
    },
    analyzeButtonText: {
        color: COLORS.surface,
        fontWeight: '600',
        fontSize: 15,
    },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.errorBg,
        padding: SPACING.md,
        borderRadius: ROUNDING.md,
        marginTop: SPACING.md,
    },
    stepCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepText: {
        color: COLORS.surface,
        fontWeight: '700',
        fontSize: 12,
    },
    scoreCard: {
        backgroundColor: COLORS.primary,
        padding: SPACING.xl,
        borderRadius: ROUNDING.lg,
        marginBottom: SPACING.lg,
    },
    scoreHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    scoreCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    bigScore: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.surface,
    },
    scorePercent: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        marginLeft: 2,
    },
    subScoresContainer: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginBottom: SPACING.xl,
    },
    subScoreCard: {
        flex: 1,
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: COLORS.surface,
        borderRadius: ROUNDING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    subScoreValue: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.secondary,
        marginBottom: 2,
    },
    suggestionRow: {
        flexDirection: 'row',
        paddingVertical: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        alignItems: 'center',
    },
    suggestionDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: SPACING.md,
    }
});
