import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { globalStyles, TYPOGRAPHY, COLORS, SPACING, ROUNDING, SHADOWS } from '../styles/theme';

interface SectionEditorProps {
    editingSection: any;
    setEditingSection: (section: any) => void;
    handleSaveSection: (section: any) => void;
    getIconForType: (type: string) => string;
}

const SectionEditor: React.FC<SectionEditorProps> = ({
    editingSection,
    setEditingSection,
    handleSaveSection,
    getIconForType
}) => {
    if (!editingSection) return null;

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...(editingSection.content.items || [])];
        newItems[index] = { ...newItems[index], [field]: value };
        setEditingSection({ ...editingSection, content: { ...editingSection.content, items: newItems } });
    };

    const addItem = (defaultObj: any) => {
        setEditingSection({
            ...editingSection,
            content: {
                ...editingSection.content,
                items: [...(editingSection.content?.items || []), defaultObj]
            }
        });
    };

    return (
        <View style={styles.editorContainer}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
                    <MaterialCommunityIcons name={getIconForType(editingSection.type) as any} size={22} color={COLORS.primary} />
                    <Text style={TYPOGRAPHY.h3}>Edit {editingSection.name}</Text>
                </View>
                <TouchableOpacity onPress={() => setEditingSection(null)}>
                    <Feather name="x" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
            </View>

            <Text style={TYPOGRAPHY.label}>Section Title</Text>
            <TextInput
                style={[globalStyles.inputBase, { marginBottom: SPACING.md }]}
                value={editingSection.name}
                onChangeText={(v) => setEditingSection({ ...editingSection, name: v })}
            />

            {editingSection.type === 'experience' && (
                <View>
                    {(editingSection.content?.items || []).map((item: any, i: number) => (
                        <View key={i} style={styles.itemBox}>
                            <View style={styles.formRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={TYPOGRAPHY.label}>Title</Text>
                                    <TextInput style={globalStyles.inputBase} value={item.title} onChangeText={(v) => updateItem(i, 'title', v)} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={TYPOGRAPHY.label}>Company</Text>
                                    <TextInput style={globalStyles.inputBase} value={item.company} onChangeText={(v) => updateItem(i, 'company', v)} />
                                </View>
                            </View>
                            <View style={styles.formRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={TYPOGRAPHY.label}>Location</Text>
                                    <TextInput style={globalStyles.inputBase} value={item.location} onChangeText={(v) => updateItem(i, 'location', v)} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={TYPOGRAPHY.label}>Dates</Text>
                                    <TextInput
                                        style={globalStyles.inputBase}
                                        placeholder="MM/YYYY - MM/YYYY"
                                        value={`${item.startDate || ''}${item.endDate || item.isCurrent ? ' - ' + (item.isCurrent ? 'Present' : item.endDate) : ''}`}
                                        onChangeText={(v) => {
                                            const parts = v.split(' - ');
                                            const startDate = parts[0]?.trim() || '';
                                            const endDateStr = parts[1]?.trim() || '';
                                            const isCurrent = endDateStr.toLowerCase() === 'present';
                                            const newItems = [...(editingSection.content.items || [])];
                                            newItems[i] = { ...newItems[i], startDate, endDate: isCurrent ? null : endDateStr, isCurrent };
                                            setEditingSection({ ...editingSection, content: { ...editingSection.content, items: newItems } });
                                        }}
                                    />
                                </View>
                            </View>
                            <Text style={TYPOGRAPHY.label}>Bullets (one per line)</Text>
                            <TextInput
                                style={[globalStyles.inputBase, { height: 100, textAlignVertical: 'top' }]}
                                multiline
                                value={(item.bullets || []).join('\n')}
                                onChangeText={(v) => updateItem(i, 'bullets', v.split('\n'))}
                            />
                        </View>
                    ))}
                    <TouchableOpacity onPress={() => addItem({ title: '', company: '', bullets: [] })}>
                        <Text style={styles.addButton}>+ Add Role</Text>
                    </TouchableOpacity>
                </View>
            )}

            {editingSection.type === 'education' && (
                <View>
                    {(editingSection.content?.items || []).map((item: any, i: number) => (
                        <View key={i} style={styles.itemBox}>
                            <View style={styles.formRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={TYPOGRAPHY.label}>Institution</Text>
                                    <TextInput style={globalStyles.inputBase} value={item.institution} onChangeText={(v) => updateItem(i, 'institution', v)} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={TYPOGRAPHY.label}>Degree</Text>
                                    <TextInput style={globalStyles.inputBase} value={item.degree} onChangeText={(v) => updateItem(i, 'degree', v)} />
                                </View>
                            </View>
                            <View style={styles.formRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={TYPOGRAPHY.label}>Field</Text>
                                    <TextInput style={globalStyles.inputBase} value={item.field} onChangeText={(v) => updateItem(i, 'field', v)} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={TYPOGRAPHY.label}>Dates</Text>
                                    <TextInput style={globalStyles.inputBase} value={`${item.startDate || ''} - ${item.endDate || ''}`} onChangeText={(v) => {
                                        const parts = v.split(' - ');
                                        const newItems = [...(editingSection.content.items || [])];
                                        newItems[i] = { ...newItems[i], startDate: parts[0]?.trim() || '', endDate: parts[1]?.trim() || '' };
                                        setEditingSection({ ...editingSection, content: { ...editingSection.content, items: newItems } });
                                    }} />
                                </View>
                            </View>
                            <View style={{ width: '50%' }}>
                                <Text style={TYPOGRAPHY.label}>GPA</Text>
                                <TextInput style={globalStyles.inputBase} value={item.gpa} onChangeText={(v) => updateItem(i, 'gpa', v)} />
                            </View>
                        </View>
                    ))}
                    <TouchableOpacity onPress={() => addItem({ institution: '', degree: '' })}>
                        <Text style={styles.addButton}>+ Add Education</Text>
                    </TouchableOpacity>
                </View>
            )}

            {editingSection.type === 'skills' && (
                <View>
                    {(editingSection.content?.categories || []).map((cat: any, i: number) => (
                        <View key={i} style={styles.itemBox}>
                            <Text style={TYPOGRAPHY.label}>Category Name</Text>
                            <TextInput
                                style={[globalStyles.inputBase, { marginBottom: SPACING.xs }]}
                                value={cat.name}
                                onChangeText={(v) => {
                                    const newCats = [...(editingSection.content.categories || [])];
                                    newCats[i] = { ...newCats[i], name: v };
                                    setEditingSection({ ...editingSection, content: { ...editingSection.content, categories: newCats } });
                                }}
                            />
                            <Text style={TYPOGRAPHY.label}>Skills (comma separated)</Text>
                            <TextInput
                                style={[globalStyles.inputBase]}
                                value={(cat.items || []).join(', ')}
                                onChangeText={(v) => {
                                    const newCats = [...(editingSection.content.categories || [])];
                                    newCats[i] = { ...newCats[i], items: v.split(',').map((s: string) => s.trim()).filter((s: string) => s) };
                                    setEditingSection({ ...editingSection, content: { ...editingSection.content, categories: newCats } });
                                }}
                            />
                        </View>
                    ))}
                    <TouchableOpacity onPress={() => {
                        const newCats = [...(editingSection.content?.categories || []), { name: '', items: [] }];
                        setEditingSection({ ...editingSection, content: { ...editingSection.content, categories: newCats } });
                    }}>
                        <Text style={styles.addButton}>+ Add Skill Category</Text>
                    </TouchableOpacity>
                </View>
            )}

            {editingSection.type === 'projects' && (
                <View>
                    {(editingSection.content?.items || []).map((item: any, i: number) => (
                        <View key={i} style={styles.itemBox}>
                            <View style={styles.formRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={TYPOGRAPHY.label}>Project Name</Text>
                                    <TextInput style={globalStyles.inputBase} value={item.name} onChangeText={(v) => updateItem(i, 'name', v)} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={TYPOGRAPHY.label}>URL (optional)</Text>
                                    <TextInput style={globalStyles.inputBase} value={item.url} onChangeText={(v) => updateItem(i, 'url', v)} />
                                </View>
                            </View>
                            <View style={{ marginBottom: SPACING.xs }}>
                                <Text style={TYPOGRAPHY.label}>Description</Text>
                                <TextInput style={globalStyles.inputBase} value={item.description} onChangeText={(v) => updateItem(i, 'description', v)} />
                            </View>
                            <View style={{ marginBottom: SPACING.xs }}>
                                <Text style={TYPOGRAPHY.label}>Technologies (comma separated)</Text>
                                <TextInput
                                    style={globalStyles.inputBase}
                                    value={(item.technologies || []).join(', ')}
                                    onChangeText={(v) => updateItem(i, 'technologies', v.split(',').map((s: string) => s.trim()).filter((s: string) => s))}
                                />
                            </View>
                            <Text style={TYPOGRAPHY.label}>Highlights (one per line)</Text>
                            <TextInput
                                style={[globalStyles.inputBase, { height: 80, textAlignVertical: 'top' }]}
                                multiline
                                value={(item.highlights || []).join('\n')}
                                onChangeText={(v) => updateItem(i, 'highlights', v.split('\n'))}
                            />
                        </View>
                    ))}
                    <TouchableOpacity onPress={() => addItem({ name: '', url: '', description: '', technologies: [], highlights: [] })}>
                        <Text style={styles.addButton}>+ Add Project</Text>
                    </TouchableOpacity>
                </View>
            )}

            {(!['experience', 'education', 'skills', 'projects'].includes(editingSection.type)) && (
                <View>
                    <Text style={TYPOGRAPHY.label}>JSON Content Mapping (Raw)</Text>
                    <TextInput
                        style={[globalStyles.inputBase, { height: 200, fontFamily: 'monospace', fontSize: 12, textAlignVertical: 'top' }]}
                        multiline
                        value={JSON.stringify(editingSection.content, null, 2)}
                        onChangeText={(v) => { try { setEditingSection({ ...editingSection, content: JSON.parse(v) }); } catch (e) { } }}
                    />
                </View>
            )}

            <TouchableOpacity
                style={[globalStyles.button, globalStyles.buttonPrimary, { marginTop: SPACING.md }]}
                onPress={() => handleSaveSection(editingSection)}
            >
                <Text style={globalStyles.buttonPrimaryText}>Confirm Details</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    editorContainer: {
        backgroundColor: COLORS.surface,
        padding: SPACING.lg,
        borderRadius: ROUNDING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.card,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    itemBox: {
        backgroundColor: COLORS.surface,
        padding: SPACING.lg,
        borderRadius: ROUNDING.lg,
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.card,
    },
    formRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginBottom: SPACING.sm,
    },
    addButton: {
        color: COLORS.primary,
        fontWeight: '700',
        fontSize: 14,
        marginTop: SPACING.sm,
        textAlign: 'center',
        paddingVertical: SPACING.md,
        borderRadius: ROUNDING.md,
        backgroundColor: COLORS.primaryLight,
        overflow: 'hidden',
    }
});

export default React.memo(SectionEditor);
