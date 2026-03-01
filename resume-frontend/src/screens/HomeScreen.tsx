import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
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
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.sm }}>
                        <View style={styles.headerIconFrame}>
                            <MaterialCommunityIcons name="lightning-bolt" size={24} color={COLORS.primary} />
                        </View>
                        <Text style={TYPOGRAPHY.h1}>My Resumes</Text>
                    </View>
                    <Text style={TYPOGRAPHY.body1}>Manage and optimize your professional documents for ATS compatibility.</Text>
                </View>

                <View style={styles.listContainer}>
                    <Text style={[TYPOGRAPHY.h4, { marginBottom: SPACING.md, paddingHorizontal: SPACING.xl }]}>Recent Documents</Text>

                    {loading ? (
                        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
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
                                        <MaterialCommunityIcons name="file-document-edit-outline" size={48} color={COLORS.primary} />
                                    </View>
                                    <Text style={[TYPOGRAPHY.h3, { marginTop: SPACING.md }]}>No Resumes Yet</Text>
                                    <Text style={[TYPOGRAPHY.body2, { textAlign: 'center', marginTop: SPACING.sm, maxWidth: 400 }]}>
                                        Create your first highly-optimized professional resume to get started on your job search.
                                    </Text>
                                </View>
                            }
                        />
                    )}
                </View>

                {/* PREMIUM GLASS FAB */}
                <View style={styles.fabWrapper}>
                    <View style={styles.fabContainer}>
                        <TouchableOpacity
                            style={styles.fabSecondary}
                            onPress={() => navigation.navigate('ATSChecker')}
                            activeOpacity={0.7}
                        >
                            <MaterialCommunityIcons name="radar" size={20} color={COLORS.primary} />
                            <Text style={styles.fabSecondaryText}>ATS Scan</Text>
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
        paddingTop: SPACING.xxl + SPACING.lg,
        paddingBottom: SPACING.xl,
        backgroundColor: COLORS.background,
    },
    headerIconFrame: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: ROUNDING.md,
        ...SHADOWS.card,
    },
    listContainer: {
        flex: 1,
    },
    actionArrow: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primaryLight,
        borderRadius: ROUNDING.md,
    },
    iconAction: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: ROUNDING.md,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.xxl,
        marginTop: SPACING.xxl,
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
        borderRadius: ROUNDING.lg,
        padding: 6,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.floating,
        width: '100%',
        maxWidth: 380,
    },
    fabPrimary: {
        flex: 1.2,
        backgroundColor: COLORS.primary,
        height: 52,
        borderRadius: ROUNDING.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        ...SHADOWS.button,
    },
    fabPrimaryText: {
        color: COLORS.surface,
        fontWeight: '700',
        fontSize: 15,
    },
    fabSecondary: {
        flex: 1,
        height: 52,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    fabSecondaryText: {
        color: COLORS.secondary,
        fontWeight: '600',
        fontSize: 15,
    },
    fabDivider: {
        width: 1,
        height: 24,
        backgroundColor: COLORS.border,
        marginHorizontal: 8,
    }
});
