import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, Platform } from 'react-native';
import { globalStyles, COLORS, SPACING, TYPOGRAPHY, ROUNDING, METRICS, SHADOWS } from '../styles/theme';
import { api } from '../services/api';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

interface ResumeMetadata {
    id: string;
    title: string;
    template_id: string;
    updated_at: string;
}

export default function HomeScreen({ navigation }: any) {
    const [resumes, setResumes] = useState<ResumeMetadata[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResumes();
    }, []);

    const fetchResumes = async () => {
        try {
            const response = await api.get('/resumes');
            setResumes(response.data.data);
        } catch (error) {
            console.error('Failed to fetch resumes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: string, title: string) => {
        Alert.alert(
            "Delete Resume",
            `Are you sure you want to delete "${title}"? This action cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete(`/resumes/${id}`);
                            fetchResumes(); // Refresh the list
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete the resume.");
                        }
                    }
                }
            ]
        );
    };

    const renderResumeCard = ({ item }: { item: ResumeMetadata }) => (
        <TouchableOpacity
            style={[globalStyles.card, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.lg }]}
            onPress={() => navigation.navigate('ResumeBuilder', { id: item.id })}
            activeOpacity={0.7}
        >
            <View style={{ flex: 1, paddingRight: SPACING.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
                    <Text style={TYPOGRAPHY.h3}>{item.title}</Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: SPACING.xs, gap: SPACING.sm }}>
                    <View style={globalStyles.badge}>
                        <Text style={globalStyles.badgeText}>{item.template_id}</Text>
                    </View>
                    <Text style={TYPOGRAPHY.caption}>•</Text>
                    <Text style={TYPOGRAPHY.caption}>Active Draft</Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: SPACING.md }}>
                    <Feather name="clock" size={14} color={COLORS.textSecondary} />
                    <Text style={[TYPOGRAPHY.caption, { marginLeft: 4 }]}>
                        Last updated {new Date(item.updated_at).toLocaleDateString()}
                    </Text>
                </View>
            </View>

            <View style={{ flexDirection: 'row', gap: SPACING.md }}>
                <TouchableOpacity
                    style={[styles.iconAction, { backgroundColor: COLORS.errorBg }]}
                    onPress={() => handleDelete(item.id, item.title)}
                >
                    <Feather name="trash-2" size={18} color={COLORS.error} />
                </TouchableOpacity>
                <View style={styles.actionArrow}>
                    <Feather name="chevron-right" size={24} color={COLORS.primary} />
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={globalStyles.safeArea}>
            <View style={globalStyles.webContentWrapper}>

                <View style={styles.header}>
                    <Text style={[TYPOGRAPHY.h1, { marginBottom: 4 }]}>Professional Portfolio</Text>
                    <Text style={TYPOGRAPHY.body1}>Curate and optimize your career documents for maximum visibility.</Text>
                </View>

                <View style={styles.listContainer}>
                    <Text style={styles.sectionHeader}>Saved Documents</Text>

                    {loading ? (
                        <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 40 }} />
                    ) : (
                        <FlatList
                            data={resumes}
                            keyExtractor={(item) => item.id}
                            renderItem={renderResumeCard}
                            contentContainerStyle={{ paddingHorizontal: SPACING.xl, paddingBottom: 150 }}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <View style={styles.emptyState}>
                                    <View style={styles.emptyStateIconFrame}>
                                        <MaterialCommunityIcons name="file-plus-outline" size={40} color={COLORS.primary} />
                                    </View>
                                    <Text style={[TYPOGRAPHY.h3, { marginTop: SPACING.lg, fontWeight: '700' }]}>Ready to start?</Text>
                                    <Text style={[TYPOGRAPHY.body2, { textAlign: 'center', marginTop: 4, maxWidth: 360 }]}>
                                        Build a professional, ATS-optimized resume in minutes using our guided engine.
                                    </Text>
                                </View>
                            }
                        />
                    )}
                </View>

                {/* PROFESSIONAL FAB */}
                <View style={styles.fabWrapper}>
                    <View style={styles.fabContainer}>
                        <TouchableOpacity
                            style={styles.fabSecondary}
                            onPress={() => navigation.navigate('ATSChecker')}
                            activeOpacity={0.7}
                        >
                            <MaterialCommunityIcons name="shield-search" size={20} color={COLORS.primary} />
                            <Text style={styles.fabSecondaryText}>ATS Diagnostic</Text>
                        </TouchableOpacity>

                        <View style={styles.fabDivider} />

                        <TouchableOpacity
                            style={styles.fabPrimary}
                            onPress={() => navigation.navigate('ResumeBuilder')}
                            activeOpacity={0.7}
                        >
                            <Feather name="plus" size={20} color={COLORS.surface} />
                            <Text style={styles.fabPrimaryText}>Create New</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: SPACING.xl,
        paddingTop: Platform.OS === 'web' ? 60 : 80,
        paddingBottom: SPACING.xl,
    },
    sectionHeader: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: SPACING.lg,
        paddingHorizontal: SPACING.xl,
    },
    listContainer: {
        flex: 1,
    },
    actionArrow: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primaryLight,
        borderRadius: ROUNDING.md,
    },
    iconAction: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: ROUNDING.md,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        marginTop: 40,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
        borderRadius: ROUNDING.md,
    },
    emptyStateIconFrame: {
        padding: SPACING.xl,
        backgroundColor: COLORS.primaryLight,
        borderRadius: ROUNDING.full,
    },
    fabWrapper: {
        position: 'absolute',
        bottom: SPACING.xl,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
    },
    fabContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: ROUNDING.sm,
        padding: 4,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.card,
        width: '100%',
        maxWidth: 400,
    },
    fabPrimary: {
        flex: 1,
        backgroundColor: COLORS.primary,
        height: 48,
        borderRadius: ROUNDING.sm - 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    fabPrimaryText: {
        color: COLORS.surface,
        fontWeight: '700',
        fontSize: 14,
    },
    fabSecondary: {
        flex: 1,
        height: 48,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    fabSecondaryText: {
        color: COLORS.primary,
        fontWeight: '700',
        fontSize: 14,
    },
    fabDivider: {
        width: 1,
        height: 20,
        backgroundColor: COLORS.border,
        marginHorizontal: 4,
    }
});
