import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, TextInput, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
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
        formData.append('file', {
            uri: file.uri,
            name: file.name,
            type: file.mimeType || 'application/pdf',
        } as any);

        if (jobDescription.trim()) {
            formData.append('jobDescription', jobDescription.trim());
        }

        try {
            const res = await api.post('/ats/analyze', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
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
                    <Feather name="arrow-left" size={20} color={COLORS.secondary} />
                    <Text style={{ color: COLORS.secondary, fontWeight: '600', marginLeft: SPACING.xs }}>Dashboard</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={globalStyles.container} showsVerticalScrollIndicator={false}>
                <View style={globalStyles.webContentWrapper}>
                    <View style={globalStyles.content}>

                        <View style={{ marginBottom: SPACING.xl }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.xs }}>
                                <MaterialCommunityIcons name="radar" size={32} color={COLORS.primary} />
                                <Text style={TYPOGRAPHY.h1}>ATS Scan</Text>
                            </View>
                            <Text style={TYPOGRAPHY.body1}>Upload your resume and a target job description to mathematically calculate your Applicant Tracking System compatibility.</Text>
                        </View>

                        <View style={globalStyles.card}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md }}>
                                <View style={styles.stepCircle}>
                                    <Text style={styles.stepText}>1</Text>
                                </View>
                                <Text style={TYPOGRAPHY.h3}>Upload Resume (PDF)</Text>
                            </View>

                            <TouchableOpacity
                                style={[styles.uploadBox, file ? styles.uploadBoxActive : null]}
                                onPress={pickDocument}
                                activeOpacity={0.7}
                            >
                                <MaterialCommunityIcons
                                    name={file ? "file-pdf-box" : "cloud-upload-outline"}
                                    size={48}
                                    color={file ? COLORS.primary : COLORS.textSecondary}
                                />
                                <Text style={[TYPOGRAPHY.h3, { marginTop: SPACING.sm, color: file ? COLORS.primary : COLORS.secondary }]}>
                                    {file ? file.name : 'Tap to select PDF'}
                                </Text>
                                {file ? (
                                    <Text style={TYPOGRAPHY.body2}>{(file.size / 1024).toFixed(1)} KB • Ready for scan</Text>
                                ) : (
                                    <Text style={TYPOGRAPHY.body2}>Maximum file size 10MB</Text>
                                )}
                            </TouchableOpacity>

                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.xl, marginBottom: SPACING.md }}>
                                <View style={styles.stepCircle}>
                                    <Text style={styles.stepText}>2</Text>
                                </View>
                                <Text style={TYPOGRAPHY.h3}>Target Job Description <Text style={{ color: COLORS.textSecondary, fontWeight: '400', fontSize: 16 }}>(Optional)</Text></Text>
                            </View>

                            <TextInput
                                style={[globalStyles.inputBase, { height: 160, textAlignVertical: 'top' }]}
                                placeholder="Paste the full job description here to enable Keyword Matching mode..."
                                placeholderTextColor={COLORS.textSecondary}
                                multiline
                                value={jobDescription}
                                onChangeText={setJobDescription}
                            />

                            {error && (
                                <View style={styles.errorBox}>
                                    <Feather name="alert-circle" size={20} color={COLORS.error} />
                                    <Text style={{ color: COLORS.error, marginLeft: SPACING.sm, flex: 1 }}>{error}</Text>
                                </View>
                            )}

                            <TouchableOpacity
                                style={[globalStyles.button, { marginTop: SPACING.xl }]}
                                onPress={analyzeResume}
                                disabled={loading || !file}
                                activeOpacity={0.8}
                            >
                                {loading ? (
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <ActivityIndicator color={COLORS.surface} size="small" />
                                        <Text style={[globalStyles.buttonText, { marginLeft: SPACING.sm }]}>Scanning Document...</Text>
                                    </View>
                                ) : (
                                    <>
                                        <Text style={globalStyles.buttonText}>Run ATS Analysis</Text>
                                        <Feather name="arrow-right" size={20} color={COLORS.surface} style={{ marginLeft: SPACING.sm }} />
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>

                        {results && (
                            <View style={{ marginTop: SPACING.xl }}>
                                <Text style={TYPOGRAPHY.h2}>Analysis Report</Text>

                                <View style={[globalStyles.card, styles.scoreCard]}>
                                    <View style={{ alignItems: 'center' }}>
                                        <Text style={styles.bigScore}>
                                            {results.overallScore.toFixed(0)}<Text style={styles.scoreDenominator}>/100</Text>
                                        </Text>
                                        <View style={globalStyles.badge}>
                                            <Text style={globalStyles.badgeText}>{results.overallScore >= 80 ? 'Excellent' : results.overallScore >= 60 ? 'Good' : 'Needs Work'}</Text>
                                        </View>
                                    </View>
                                    <View style={{ flex: 1, paddingLeft: SPACING.xl }}>
                                        <Text style={TYPOGRAPHY.h3}>Overall Match Rank</Text>
                                        <Text style={TYPOGRAPHY.body1}>Your resume {results.overallScore >= 80 ? 'is highly optimized' : 'requires optimization'} to pass automated HR screening tools effectively.</Text>
                                    </View>
                                </View>

                                {/* Sub-scores */}
                                <View style={styles.subScoresContainer}>
                                    <View style={[globalStyles.card, styles.subScoreCard]}>
                                        <Text style={styles.subScoreValue}>{(results.sectionScores.keywords || 0).toFixed(0)}</Text>
                                        <Text style={TYPOGRAPHY.label}>Keywords</Text>
                                    </View>
                                    <View style={[globalStyles.card, styles.subScoreCard]}>
                                        <Text style={styles.subScoreValue}>{(results.sectionScores.format || 0).toFixed(0)}</Text>
                                        <Text style={TYPOGRAPHY.label}>Format</Text>
                                    </View>
                                    <View style={[globalStyles.card, styles.subScoreCard]}>
                                        <Text style={styles.subScoreValue}>{(results.sectionScores.readability || 0).toFixed(0)}</Text>
                                        <Text style={TYPOGRAPHY.label}>Readability</Text>
                                    </View>
                                </View>

                                {results.suggestions && results.suggestions.length > 0 && (
                                    <View style={globalStyles.card}>
                                        <Text style={[TYPOGRAPHY.h3, { marginBottom: SPACING.md }]}>Actionable Feedback</Text>
                                        {results.suggestions.map((sug: any, index: number) => (
                                            <View key={index} style={styles.suggestionRow}>
                                                <MaterialCommunityIcons
                                                    name={sug.category === 'CRITICAL' ? "alert-circle" : "lightbulb-on"}
                                                    size={24}
                                                    color={sug.category === 'CRITICAL' ? COLORS.error : COLORS.warning}
                                                />
                                                <Text style={[TYPOGRAPHY.body1, { flex: 1, marginLeft: SPACING.sm }]}>{sug.message}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {results.warnings && results.warnings.length > 0 && (
                                    <View style={[globalStyles.card, { backgroundColor: COLORS.warningBg, borderColor: COLORS.warning }]}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
                                            <Feather name="alert-triangle" size={20} color={COLORS.warning} />
                                            <Text style={[TYPOGRAPHY.h3, { color: COLORS.warning, marginLeft: SPACING.xs }]}>System Warnings</Text>
                                        </View>
                                        {results.warnings.map((warn: string, index: number) => (
                                            <Text key={index} style={[TYPOGRAPHY.body1, { color: COLORS.warning, marginLeft: SPACING.xl }]}>• {warn}</Text>
                                        ))}
                                    </View>
                                )}
                            </View>
                        )}

                        <View style={{ height: 100 }} />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    topBar: {
        paddingHorizontal: SPACING.xl,
        paddingTop: SPACING.xl,
        paddingBottom: SPACING.sm,
        backgroundColor: COLORS.background,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        alignSelf: 'flex-start',
    },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepText: {
        color: COLORS.primaryDark,
        fontWeight: '800',
        fontSize: 16,
    },
    uploadBox: {
        alignItems: 'center',
        justifyContent: 'center',
        borderStyle: 'dashed',
        borderColor: COLORS.border,
        borderWidth: 2,
        borderRadius: ROUNDING.lg,
        padding: SPACING.xxl,
        backgroundColor: '#F8FAFC',
    },
    uploadBoxActive: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primaryLight,
    },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.errorBg,
        padding: SPACING.md,
        borderRadius: ROUNDING.md,
        marginTop: SPACING.lg,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.error,
    },
    scoreCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primaryLight,
        borderColor: 'rgba(67, 56, 202, 0.2)',
        borderWidth: 1,
        padding: SPACING.xxl,
    },
    bigScore: {
        fontSize: 56,
        fontWeight: '900',
        color: COLORS.primaryDark,
        letterSpacing: -2,
        marginBottom: SPACING.xs,
    },
    scoreDenominator: {
        fontSize: 24,
        fontWeight: '700',
        color: 'rgba(49, 46, 129, 0.5)',
    },
    subScoresContainer: {
        flexDirection: 'row',
        gap: SPACING.lg,
        marginBottom: SPACING.lg,
    },
    subScoreCard: {
        flex: 1,
        alignItems: 'center',
        padding: SPACING.lg,
        marginBottom: 0,
    },
    subScoreValue: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.secondary,
        marginBottom: SPACING.xs,
    },
    suggestionRow: {
        flexDirection: 'row',
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        alignItems: 'flex-start',
    }
});
