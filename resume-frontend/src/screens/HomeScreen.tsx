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
            style={[globalStyles.card, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
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
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.xs }}>
                        <MaterialCommunityIcons name="file-document-outline" size={32} color={COLORS.primary} />
                        <Text style={TYPOGRAPHY.h2}>Dashboard</Text>
                    </View>
                    <Text style={TYPOGRAPHY.body1}>Manage your professional profiles, update your experience, and check your ATS compatibility scores.</Text>
                </View>

                <View style={styles.listContainer}>
                    <Text style={[TYPOGRAPHY.h4, { marginBottom: SPACING.md, paddingHorizontal: SPACING.md }]}>Recent Documents</Text>

                    {loading ? (
                        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
                    ) : (
                        <FlatList
                            data={resumes}
                            keyExtractor={(item) => item.id}
                            renderItem={renderResumeCard}
                            contentContainerStyle={{ paddingHorizontal: SPACING.md, paddingBottom: 150 }}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <View style={styles.emptyState}>
                                    <View style={styles.emptyStateIconFrame}>
                                        <MaterialCommunityIcons name="file-document-edit-outline" size={48} color={COLORS.textSecondary} />
                                    </View>
                                    <Text style={[TYPOGRAPHY.h3, { marginTop: SPACING.md }]}>No Resumes Yet</Text>
                                    <Text style={[TYPOGRAPHY.body2, { textAlign: 'center', marginTop: SPACING.sm }]}>
                                        Create your first highly-optimized professional resume to get started on your job search.
                                    </Text>
                                </View>
                            }
                        />
                    )}
                </View>

                <View style={[styles.fabContainer, { ...SHADOWS.floating }]}>
                    <TouchableOpacity
                        style={[globalStyles.button, styles.fabSecondary]}
                        onPress={() => navigation.navigate('ATSChecker')}
                        activeOpacity={0.8}
                    >
                        <MaterialCommunityIcons name="radar" size={20} color={COLORS.surface} style={{ marginRight: 8 }} />
                        <Text style={globalStyles.buttonText}>ATS Scan</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[globalStyles.button, styles.fabPrimary]}
                        onPress={() => navigation.navigate('ResumeBuilder')}
                        activeOpacity={0.8}
                    >
                        <Feather name="plus" size={20} color={COLORS.surface} style={{ marginRight: 8 }} />
                        <Text style={globalStyles.buttonText}>New Resume</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        padding: SPACING.xl,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        paddingTop: SPACING.xxl,
    },
    listContainer: {
        flex: 1,
        paddingTop: SPACING.xl,
    },
    actionArrow: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primaryLight,
        borderRadius: ROUNDING.full,
    },
    iconAction: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: ROUNDING.full,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.xxl,
        marginTop: SPACING.lg,
    },
    emptyStateIconFrame: {
        padding: SPACING.xl,
        backgroundColor: COLORS.surface,
        borderRadius: ROUNDING.full,
        ...SHADOWS.card,
    },
    fabContainer: {
        position: 'absolute',
        bottom: SPACING.lg,
        alignSelf: 'center',
        flexDirection: 'row',
        gap: SPACING.md,
        width: '100%',
        maxWidth: 600,
        paddingHorizontal: SPACING.lg,
        backgroundColor: 'transparent',
    },
    fabPrimary: {
        flex: 1,
    },
    fabSecondary: {
        flex: 1,
        backgroundColor: COLORS.secondary,
    }
});
