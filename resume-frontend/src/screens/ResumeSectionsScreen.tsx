import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Alert, StyleSheet, TextInput } from 'react-native';
import { globalStyles, TYPOGRAPHY, COLORS, SPACING, ROUNDING, SHADOWS } from '../styles/theme';
import { api } from '../services/api';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

interface Section {
    id: string;
    type: string;
    name: string;
    orderIndex: number;
    content: any;
}

export default function ResumeSectionsScreen({ navigation, route }: any) {
    const resumeId = route.params?.id;
    const resumeTitle = route.params?.title || 'Resume';

    const [loading, setLoading] = useState(true);
    const [sections, setSections] = useState<Section[]>([]);

    // Editor State
    const [editingSection, setEditingSection] = useState<Section | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (resumeId) {
            fetchSections();
        }
    }, [resumeId]);

    const fetchSections = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/resumes/${resumeId}/sections`);
            setSections(res.data.data.sort((a: any, b: any) => a.orderIndex - b.orderIndex));
        } catch (err) {
            console.error('Failed to fetch sections:', err);
            Alert.alert('Error', 'Failed to load sections.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (sectionId: string) => {
        Alert.alert(
            "Delete Section",
            "Are you sure you want to delete this section? This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete(`/resumes/${resumeId}/sections/${sectionId}`);
                            fetchSections();
                        } catch (err) {
                            Alert.alert('Error', 'Failed to delete section.');
                        }
                    }
                }
            ]
        );
    };

    const handleSave = async () => {
        if (!editingSection) return;
        setSaving(true);

        try {
            if (editingSection.id.startsWith('new-')) {
                // Create
                const payload = {
                    type: editingSection.type,
                    name: editingSection.name,
                    orderIndex: sections.length,
                    content: editingSection.content
                };
                await api.post(`/resumes/${resumeId}/sections`, payload);
            } else {
                // Update
                const payload = {
                    name: editingSection.name,
                    content: editingSection.content
                };
                await api.put(`/resumes/${resumeId}/sections/${editingSection.id}`, payload);
            }
            setEditingSection(null);
            fetchSections();
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to save section.');
        } finally {
            setSaving(false);
        }
    };

    const addNewSection = (type: string) => {
        const newSec: Section = {
            id: `new-${Date.now()}`,
            type,
            name: type.charAt(0).toUpperCase() + type.slice(1),
            orderIndex: sections.length,
            content: { items: [] }
        };
        setEditingSection(newSec);
    };

    const renderEditor = () => {
        if (!editingSection) return null;

        const isExperience = editingSection.type === 'experience';
        const isEducation = editingSection.type === 'education';
        const isSkills = editingSection.type === 'skills';

        return (
            <View style={globalStyles.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg }}>
                    <Text style={TYPOGRAPHY.h2}>{editingSection.id.startsWith('new-') ? 'New' : 'Edit'} {editingSection.name}</Text>
                    <TouchableOpacity onPress={() => setEditingSection(null)}>
                        <Feather name="x" size={24} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                </View>

                {isExperience && (
                    <Text style={TYPOGRAPHY.body1}>Experience implementation goes here (Array of Roles, Companies, Dates, Bullets). To keep this simple for the MVP demo, we are appending raw JSON structure.</Text>
                )}

                <Text style={[TYPOGRAPHY.label, { marginTop: SPACING.md }]}>Section Name</Text>
                <TextInput
                    style={globalStyles.inputBase}
                    value={editingSection.name}
                    onChangeText={(v) => setEditingSection({ ...editingSection, name: v })}
                />

                <Text style={[TYPOGRAPHY.label, { marginTop: SPACING.md }]}>Raw JSON Content (Demo Override)</Text>
                <TextInput
                    style={[globalStyles.inputBase, { height: 200, textAlignVertical: 'top', fontFamily: 'monospace', fontSize: 12 }]}
                    multiline
                    value={JSON.stringify(editingSection.content, null, 2)}
                    onChangeText={(v) => {
                        try {
                            const parsed = JSON.parse(v);
                            setEditingSection({ ...editingSection, content: parsed });
                        } catch (e) { /* ignore parse errors while typing */ }
                    }}
                />

                <TouchableOpacity style={[globalStyles.button, { marginTop: SPACING.xl }]} onPress={handleSave} disabled={saving}>
                    {saving ? <ActivityIndicator color={COLORS.surface} /> : <Text style={globalStyles.buttonText}>Save Section Target</Text>}
                </TouchableOpacity>
            </View>
        );
    };

    const getIconForType = (type: string) => {
        switch (type) {
            case 'experience': return 'briefcase-outline';
            case 'education': return 'school-outline';
            case 'skills': return 'star-outline';
            case 'projects': return 'application-brackets-outline';
            default: return 'format-list-bulleted';
        }
    };

    return (
        <SafeAreaView style={globalStyles.safeArea}>
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="arrow-left" size={20} color={COLORS.secondary} />
                    <Text style={{ color: COLORS.secondary, fontWeight: '600', marginLeft: SPACING.xs }}>{resumeTitle}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={globalStyles.container} showsVerticalScrollIndicator={false}>
                <View style={globalStyles.webContentWrapper}>
                    <View style={globalStyles.content}>

                        <View style={{ marginBottom: SPACING.xl, marginTop: SPACING.md }}>
                            <Text style={TYPOGRAPHY.h1}>Manage Sections</Text>
                            <Text style={TYPOGRAPHY.body1}>Add or edit the core content sections of your resume.</Text>
                        </View>

                        {loading ? (
                            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
                        ) : editingSection ? (
                            renderEditor()
                        ) : (
                            <>
                                {sections.length === 0 ? (
                                    <View style={[globalStyles.card, { alignItems: 'center', padding: SPACING.xxl }]}>
                                        <MaterialCommunityIcons name="content-save-edit-outline" size={48} color={COLORS.textSecondary} style={{ marginBottom: SPACING.md }} />
                                        <Text style={TYPOGRAPHY.h3}>No Sections Added</Text>
                                        <Text style={[TYPOGRAPHY.body2, { textAlign: 'center', marginTop: SPACING.xs }]}>Start building your resume by adding your experience and education.</Text>
                                    </View>
                                ) : (
                                    sections.map((sec) => (
                                        <View key={sec.id} style={[globalStyles.card, styles.sectionRow]}>
                                            <MaterialCommunityIcons name={getIconForType(sec.type) as any} size={28} color={COLORS.primary} />
                                            <View style={{ flex: 1, marginLeft: SPACING.md }}>
                                                <Text style={TYPOGRAPHY.h3}>{sec.name}</Text>
                                                <Text style={TYPOGRAPHY.label}>{sec.type.toUpperCase()}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
                                                <TouchableOpacity style={styles.iconButton} onPress={() => setEditingSection(sec)}>
                                                    <Feather name="edit-2" size={18} color={COLORS.secondary} />
                                                </TouchableOpacity>
                                                <TouchableOpacity style={styles.iconButton} onPress={() => handleDelete(sec.id)}>
                                                    <Feather name="trash-2" size={18} color={COLORS.error} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ))
                                )}

                                <View style={{ marginTop: SPACING.xl }}>
                                    <Text style={[TYPOGRAPHY.h4, { marginBottom: SPACING.md }]}>Add New Section</Text>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }}>
                                        {['experience', 'education', 'skills', 'projects', 'certifications', 'custom'].map((type) => (
                                            <TouchableOpacity
                                                key={type}
                                                style={styles.addTypeButton}
                                                onPress={() => addNewSection(type)}
                                            >
                                                <MaterialCommunityIcons name={getIconForType(type) as any} size={20} color={COLORS.primaryDark} />
                                                <Text style={styles.addTypeText}>{type}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </>
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
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
        paddingTop: SPACING.xl,
        paddingBottom: SPACING.sm,
        backgroundColor: COLORS.background,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    sectionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.lg,
        marginBottom: SPACING.sm,
    },
    iconButton: {
        padding: SPACING.sm,
        backgroundColor: COLORS.background,
        borderRadius: ROUNDING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    addTypeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primaryLight,
        paddingVertical: 12,
        paddingHorizontal: SPACING.md,
        borderRadius: ROUNDING.full,
        borderWidth: 1,
        borderColor: 'rgba(67, 56, 202, 0.2)',
    },
    addTypeText: {
        color: COLORS.primaryDark,
        fontWeight: 'bold',
        textTransform: 'capitalize',
        marginLeft: SPACING.xs,
    }
});
