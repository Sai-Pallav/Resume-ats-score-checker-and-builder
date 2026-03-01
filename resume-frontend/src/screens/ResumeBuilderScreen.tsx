import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, TextInput, ScrollView, ActivityIndicator, Alert, StyleSheet, Platform, useWindowDimensions, DimensionValue } from 'react-native';
import { globalStyles, TYPOGRAPHY, COLORS, SPACING, ROUNDING, SHADOWS } from '../styles/theme';
import { api } from '../services/api';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import TemplateThumbnail from '../components/TemplateThumbnail';
import SectionEditor from '../components/SectionEditor';
import PersonalDetailsForm from '../components/PersonalDetailsForm';
import SummaryEditor from '../components/SummaryEditor';
import ResumePreview from '../components/ResumePreview';

export default function ResumeBuilderScreen({ navigation, route }: any) {
    const resumeId = route.params?.id;
    const { width } = useWindowDimensions();
    const isDesktop = width >= 1024;

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [templateId, setTemplateId] = useState('modern');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('');
    const [linkedin, setLinkedin] = useState('');
    const [summary, setSummary] = useState('');

    // Sections State
    const [sections, setSections] = useState<any[]>([]);
    const [editingSection, setEditingSection] = useState<any | null>(null);

    // Live Preview State
    const [previewHtml, setPreviewHtml] = useState<string>('');
    const [previewLoading, setPreviewLoading] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const timeoutRef = useRef<any>(null);

    useEffect(() => {
        if (resumeId) {
            fetchResume();
            fetchSections();
        } else {
            // Automatically fill demo data for new resumes
            fillDemoData();
        }
    }, [resumeId]);

    const fetchResume = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/resumes/${resumeId}`);
            const data = res.data.data;

            setTitle(data.title);
            setTemplateId(data.template_id);

            const contact = data.contact_info || {};
            setFullName(contact.fullName || '');
            setEmail(contact.email || '');
            setPhone(contact.phone || '');
            setLocation(contact.location || '');
            setLinkedin(contact.linkedin || '');

            setSummary(data.summary || '');
        } catch (err: any) {
            console.error(err);
            setError('Failed to load resume details.');
        } finally {
            setLoading(false);
        }
    };

    const fetchSections = async () => {
        try {
            const res = await api.get(`/resumes/${resumeId}/sections`);
            // Map backend 'data' to frontend 'content' and 'sortOrder' to 'orderIndex'
            const mapped = res.data.data.map((s: any) => ({
                ...s,
                content: s.data,
                orderIndex: s.sortOrder
            }));
            setSections(mapped.sort((a: any, b: any) => a.orderIndex - b.orderIndex));
        } catch (err) {
            console.error('Failed to fetch sections:', err);
        }
    };

    // Trigger Live Preview on State Change
    useEffect(() => {
        // Debounce live preview calls to avoid spamming the backend
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            updateLivePreview();
        }, 300);
        return () => clearTimeout(timeoutRef.current);
    }, [templateId, fullName, email, phone, location, linkedin, summary, sections, editingSection]);

    const updateLivePreview = async () => {
        setPreviewLoading(true);
        try {
            // Build the payload for the template engine by merging the active edited section
            let mergedSections = [...sections];
            if (editingSection) {
                const idx = mergedSections.findIndex(s => s.id === editingSection.id);
                if (idx >= 0) mergedSections[idx] = editingSection;
                else mergedSections.push(editingSection);
            }

            const payload = {
                contactInfo: { fullName, email, phone, location, linkedin },
                summary,
                sections: mergedSections.map(s => ({
                    type: s.type,
                    data: s.type === 'skills' ? (s.content || { categories: [] }) : (s.content?.items || [])
                }))
            };
            const res = await api.post(`/resumes/preview?template=${templateId}`, payload);
            setPreviewHtml(res.data);
        } catch (err) {
            console.error('Live Preview Error:', err);
        } finally {
            setPreviewLoading(false);
        }
    };

    const fillDemoData = () => {
        setTitle('Demo Resume - Senior Developer');
        setTemplateId('startup');
        setFullName('Alex Rivera');
        setEmail('alex.rivera@example.com');
        setPhone('+1 (555) 019-2837');
        setLocation('San Francisco, CA');
        setLinkedin('linkedin.com/in/alexrivera-tech');
        setSummary('Results-driven Software Engineer with 8+ years of experience designing and building scalable web applications. Proven ability to lead cross-functional teams and deliver high-impact products. Passionate about cloud architecture and optimizing performance.');
        setSections([
            {
                id: 'demo-exp',
                type: 'experience',
                name: 'Experience',
                orderIndex: 0,
                content: {
                    items: [
                        { title: 'Senior Software Engineer', company: 'Tech Innovators Inc.', location: 'San Francisco, CA', startDate: '2021', isCurrent: true, bullets: ['Led team of 5 engineers to build a distributed microservices platform.', 'Improved API response time by 40%.'] },
                        { title: 'Software Engineer', company: 'Global Solutions', location: 'Seattle, WA', startDate: '2018', endDate: '2021', isCurrent: false, bullets: ['Developed high-traffic React frontend applications.', 'Integrated CI/CD pipelines reducing deployment time by 50%.'] }
                    ]
                }
            },
            {
                id: 'demo-edu',
                type: 'education',
                name: 'Education',
                orderIndex: 1,
                content: {
                    items: [
                        { institution: 'University of California, Berkeley', degree: 'B.S.', field: 'Computer Science', startDate: '2014', endDate: '2018', gpa: '3.8' }
                    ]
                }
            },
            {
                id: 'demo-skills',
                type: 'skills',
                name: 'Skills',
                orderIndex: 2,
                content: {
                    categories: [
                        { name: 'Languages', items: ['TypeScript', 'JavaScript', 'Python', 'Go', 'SQL'] },
                        { name: 'Frameworks', items: ['React', 'Node.js', 'Express', 'Next.js', 'GraphQL'] }
                    ]
                }
            }
        ]);
    };

    const saveResume = async () => {
        if (!title || !fullName) {
            Alert.alert('Validation Error', 'Resume Title and Full Name are required.');
            return;
        }

        setSaving(true);
        setError(null);

        const payload = {
            title,
            templateId,
            contactInfo: { fullName, email, phone, location, linkedin },
            summary,
        };

        try {
            if (resumeId) {
                // Update basic info
                await api.put(`/resumes/${resumeId}`, payload);
                // In a true unified builder we'd batch update sections, but for now we rely on the sections being saved individually when edited.
                // Or we update all demo sections if we just applied demo data:
                if (sections.length > 0 && sections.some(s => s.id.startsWith('demo-') || s.id.startsWith('new-'))) {
                    for (const section of sections) {
                        const sectionPayload = {
                            type: section.type,
                            name: section.name,
                            sortOrder: section.orderIndex,
                            data: section.type === 'skills' ? section.content : section.content.items
                        };
                        if (section.id.startsWith('demo-') || section.id.startsWith('new-')) {
                            await api.post(`/resumes/${resumeId}/sections`, sectionPayload);
                        } else {
                            await api.put(`/resumes/${resumeId}/sections/${section.id}`, sectionPayload);
                        }
                    }
                    fetchSections();
                }
                Alert.alert('Success', 'Resume saved successfully.');
            } else {
                const res = await api.post('/resumes', payload);
                const newId = res.data.data.id;

                // Save sections immediately
                for (let i = 0; i < sections.length; i++) {
                    const section = sections[i];
                    await api.post(`/resumes/${newId}/sections`, {
                        type: section.type,
                        name: section.name,
                        sortOrder: i,
                        data: section.type === 'skills' ? section.content : section.content.items
                    });
                }
                navigation.replace('ResumeBuilder', { id: newId });
                return;
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to save resume.');
        } finally {
            setSaving(false);
        }
    };

    // ----- SECTIONS EDITOR -----
    const handleSaveSection = (updatedSection: any) => {
        // Updates local state and triggers live preview
        if (updatedSection.id.startsWith('new-') || updatedSection.id.startsWith('demo-')) {
            const index = sections.findIndex(s => s.id === updatedSection.id);
            if (index >= 0) {
                const newArr = [...sections];
                newArr[index] = updatedSection;
                setSections(newArr);
            } else {
                setSections([...sections, updatedSection]);
            }
        } else {
            // It's an existing section, we keep it locally for preview and update on master save.
            setSections(sections.map(s => s.id === updatedSection.id ? updatedSection : s));
        }
        setEditingSection(null);
    };

    const handleDeleteSection = (sectionId: string) => {
        setSections(sections.filter(s => s.id !== sectionId));
        // If it was already saved to backend, delete it there
        if (!sectionId.startsWith('new-') && !sectionId.startsWith('demo-')) {
            api.delete(`/resumes/${resumeId}/sections/${sectionId}`).catch(console.error);
        }
    };

    const addNewSection = (type: string) => {
        const newSec = {
            id: `new-${Date.now()}`,
            type,
            name: type.charAt(0).toUpperCase() + type.slice(1),
            orderIndex: sections.length,
            content: { items: [], categories: [] }
        };
        setEditingSection(newSec);
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

    if (loading) {
        return (
            <SafeAreaView style={[globalStyles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </SafeAreaView>
        );
    }

    // Split Layout Container
    const layoutStyle = isDesktop ? { flexDirection: 'row' as const, flex: 1, backgroundColor: COLORS.background } : { flex: 1, backgroundColor: COLORS.background };
    const leftPaneStyle = isDesktop ? { width: '50%' as DimensionValue, borderRightWidth: 1, borderRightColor: COLORS.border } : { flex: 1 };
    const rightPaneStyle: any = isDesktop ? { width: '48%' as DimensionValue, marginLeft: '2%' } : { display: 'none' as const }; // Slight gap for breathing room

    return (
        <SafeAreaView style={globalStyles.safeArea}>
            <View style={layoutStyle}>

                {/* TEMPLATE SELECTION MODAL */}
                {showTemplateModal && (
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xl }}>
                                <Text style={TYPOGRAPHY.h2}>Select Template</Text>
                                <TouchableOpacity onPress={() => setShowTemplateModal(false)}>
                                    <View style={styles.iconButton}>
                                        <Feather name="x" size={24} color={COLORS.textSecondary} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: SPACING.xl }}>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, justifyContent: 'center' }}>
                                    {['classic', 'modern', 'minimal', 'professional', 'creative', 'executive', 'startup', 'academic'].map(tpl => (
                                        <View key={tpl} style={{ width: 140 }}>
                                            <TemplateThumbnail type={tpl as any} isActive={templateId === tpl} onPress={() => { setTemplateId(tpl); setShowTemplateModal(false); }} />
                                            <Text style={{ textAlign: 'center', marginTop: SPACING.sm, fontWeight: templateId === tpl ? 'bold' : 'normal', color: templateId === tpl ? COLORS.primary : COLORS.text }}>
                                                {tpl.charAt(0).toUpperCase() + tpl.slice(1)}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                )}

                {/* LEFT PANE - EDITOR */}
                <View style={leftPaneStyle}>
                    <View style={styles.topBar}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <View style={styles.backIconFrame}>
                                <Feather name="chevron-left" size={20} color={COLORS.primary} />
                            </View>
                            <Text style={{ color: COLORS.secondary, fontWeight: '700', fontSize: 15 }}>Dashboard</Text>
                        </TouchableOpacity>

                        <View style={{ flexDirection: 'row', gap: SPACING.md }}>
                            {resumeId && (
                                <TouchableOpacity
                                    style={styles.atsScoreButton}
                                    onPress={() => navigation.navigate('ATSChecker', { resumeId })}
                                    activeOpacity={0.8}
                                >
                                    <MaterialCommunityIcons name="shield-check" size={20} color={COLORS.primary} />
                                    <Text style={styles.atsScoreText}>Scan ATS</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={saveResume}
                                disabled={saving}
                                activeOpacity={0.8}
                            >
                                {saving ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <>
                                        <Feather name="save" size={18} color={COLORS.surface} />
                                        <Text style={styles.saveButtonText}>Save</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: SPACING.xl }} showsVerticalScrollIndicator={false}>
                        <View style={styles.mainHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={TYPOGRAPHY.h1}>{resumeId ? 'Refine Profile' : 'New Document'}</Text>
                                <Text style={TYPOGRAPHY.body1}>Optimize your document for peak performance.</Text>
                            </View>

                        </View>

                        {error && (
                            <View style={styles.errorBox}>
                                <Feather name="alert-circle" size={20} color={COLORS.error} />
                                <Text style={{ color: COLORS.error, marginLeft: SPACING.sm, flex: 1 }}>{error}</Text>
                            </View>
                        )}

                        <View style={globalStyles.glassCard}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xl }}>
                                <View style={styles.iconFrame}>
                                    <MaterialCommunityIcons name="cog-outline" size={22} color={COLORS.primary} />
                                </View>
                                <View style={{ marginLeft: SPACING.md }}>
                                    <Text style={TYPOGRAPHY.h2}>Document Settings</Text>
                                    <Text style={TYPOGRAPHY.body2}>Set your track title and visual style.</Text>
                                </View>
                            </View>

                            <View style={{ marginBottom: SPACING.xl }}>
                                <Text style={TYPOGRAPHY.label}>Document Track Title</Text>
                                <TextInput
                                    style={globalStyles.inputBase}
                                    placeholder="e.g. Senior Software Engineer - ACME Corp"
                                    placeholderTextColor={COLORS.textSecondary}
                                    value={title}
                                    onChangeText={setTitle}
                                />
                            </View>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: SPACING.sm }}>
                                <Text style={TYPOGRAPHY.label}>Template Design</Text>
                                <TouchableOpacity onPress={() => setShowTemplateModal(true)}>
                                    <Text style={{ color: COLORS.primary, fontWeight: '700', fontSize: 13 }}>Change Design</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.templatePreviewBox}>
                                <View style={styles.templateIconFrame}>
                                    <MaterialCommunityIcons name="palette-outline" size={20} color={COLORS.primary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontWeight: '700', color: COLORS.secondary, fontSize: 15 }}>{templateId.charAt(0).toUpperCase() + templateId.slice(1)}</Text>
                                    <Text style={{ color: COLORS.textSecondary, fontSize: 13 }}>Currently selected template</Text>
                                </View>
                            </View>
                        </View>

                        <PersonalDetailsForm
                            fullName={fullName} setFullName={setFullName}
                            email={email} setEmail={setEmail}
                            phone={phone} setPhone={setPhone}
                            location={location} setLocation={setLocation}
                            linkedin={linkedin} setLinkedin={setLinkedin}
                        />

                        <SummaryEditor summary={summary} setSummary={setSummary} />

                        {/* SECTIONS INLINE */}
                        <View style={globalStyles.glassCard}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xl }}>
                                <View style={styles.iconFrame}>
                                    <MaterialCommunityIcons name="format-list-bulleted-type" size={22} color={COLORS.primary} />
                                </View>
                                <View style={{ marginLeft: SPACING.md }}>
                                    <Text style={TYPOGRAPHY.h2}>Content Sections</Text>
                                    <Text style={TYPOGRAPHY.body2}>Add or edit your professional history.</Text>
                                </View>
                            </View>

                            {editingSection ? (
                                <SectionEditor
                                    editingSection={editingSection}
                                    setEditingSection={setEditingSection}
                                    handleSaveSection={handleSaveSection}
                                    getIconForType={getIconForType}
                                />
                            ) : (
                                <>
                                    <View style={{ gap: SPACING.md }}>
                                        {sections.map((sec) => (
                                            <View key={sec.id} style={styles.sectionRow}>
                                                <View style={styles.sectionIconFrame}>
                                                    <MaterialCommunityIcons name={getIconForType(sec.type) as any} size={20} color={COLORS.primary} />
                                                </View>
                                                <View style={{ flex: 1, marginLeft: SPACING.md }}>
                                                    <Text style={[TYPOGRAPHY.h3, { marginBottom: 2 }]}>{sec.name}</Text>
                                                    <Text style={[TYPOGRAPHY.caption, { textTransform: 'uppercase', letterSpacing: 1 }]}>{sec.type}</Text>
                                                </View>
                                                <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
                                                    <TouchableOpacity style={styles.iconButton} onPress={() => setEditingSection(sec)}>
                                                        <Feather name="edit-3" size={18} color={COLORS.primary} />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity style={styles.iconButton} onPress={() => handleDeleteSection(sec.id)}>
                                                        <Feather name="trash-2" size={18} color={COLORS.error} />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        ))}
                                    </View>

                                    <View style={styles.addSectionWrapper}>
                                        <Text style={[TYPOGRAPHY.label, { marginBottom: SPACING.md }]}>Add New Section</Text>
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }}>
                                            {['experience', 'education', 'skills', 'projects'].map((type) => (
                                                <TouchableOpacity key={type} style={styles.addTypeButton} onPress={() => addNewSection(type)}>
                                                    <MaterialCommunityIcons name={getIconForType(type) as any} size={16} color={COLORS.primary} />
                                                    <Text style={styles.addTypeText}>{type}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                </>
                            )}
                        </View>

                        {resumeId && (
                            <TouchableOpacity style={styles.exportCard} activeOpacity={0.8} onPress={() => {
                                const baseUrl = api.defaults.baseURL || 'http://localhost:3000/api/v1';
                                const pdfUrl = `${baseUrl}/resumes/${resumeId}/pdf?template=${templateId}`;
                                if (Platform.OS === 'web') window.open(pdfUrl, '_blank');
                            }}>
                                <View style={styles.exportIconFrame}>
                                    <MaterialCommunityIcons name="file-pdf-box" size={32} color={COLORS.surface} />
                                </View>
                                <View style={{ flex: 1, marginLeft: SPACING.lg }}>
                                    <Text style={[TYPOGRAPHY.h2, { color: COLORS.surface, marginBottom: 2 }]}>Export to PDF</Text>
                                    <Text style={[TYPOGRAPHY.body2, { color: 'rgba(255,255,255,0.8)' }]}>High-definition print-ready document</Text>
                                </View>
                                <Feather name="arrow-right" size={24} color={COLORS.surface} />
                            </TouchableOpacity>
                        )}
                        <View style={{ height: 100 }} />
                    </ScrollView>
                </View>

                {/* RIGHT PANE - LIVE PREVIEW */}
                <View style={rightPaneStyle}>
                    <View style={styles.previewHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
                            <View style={styles.previewIconFrame}>
                                <MaterialCommunityIcons name="monitor-eye" size={20} color={COLORS.primary} />
                            </View>
                            <View>
                                <Text style={TYPOGRAPHY.h3}>Live Preview</Text>
                                <Text style={TYPOGRAPHY.caption}>Real-time synchronization</Text>
                            </View>
                        </View>
                    </View>
                    <ResumePreview previewHtml={previewHtml} loading={previewLoading} />
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
        paddingTop: Platform.OS === 'web' ? SPACING.lg : SPACING.xl,
        paddingBottom: SPACING.lg,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        zIndex: 10,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    backIconFrame: {
        width: 36,
        height: 36,
        borderRadius: ROUNDING.sm,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: ROUNDING.md,
    },
    saveButtonText: {
        color: COLORS.surface,
        fontWeight: '600',
        fontSize: 14,
    },
    atsScoreButton: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: ROUNDING.md,
    },
    atsScoreText: {
        color: COLORS.secondary,
        fontWeight: '600',
        fontSize: 14,
    },
    mainHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.xl,
    },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.errorBg,
        padding: SPACING.md,
        borderRadius: ROUNDING.md,
        marginBottom: SPACING.lg,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.error,
    },
    iconFrame: {
        width: 36,
        height: 36,
        borderRadius: ROUNDING.sm,
        backgroundColor: COLORS.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    templatePreviewBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: ROUNDING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    templateIconFrame: {
        width: 32,
        height: 32,
        borderRadius: ROUNDING.sm,
        backgroundColor: COLORS.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    sectionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: COLORS.surface,
        borderRadius: ROUNDING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.sm,
    },
    sectionIconFrame: {
        width: 32,
        height: 32,
        borderRadius: ROUNDING.sm,
        backgroundColor: COLORS.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconButton: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.background,
        borderRadius: ROUNDING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    addSectionWrapper: {
        marginTop: SPACING.lg,
        paddingTop: SPACING.lg,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    addTypeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: ROUNDING.full,
        borderWidth: 1,
        borderColor: COLORS.border,
        gap: 6,
    },
    addTypeText: {
        color: COLORS.secondary,
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    exportCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        padding: SPACING.lg,
        borderRadius: ROUNDING.lg,
        marginTop: SPACING.xl,
    },
    exportIconFrame: {
        width: 48,
        height: 48,
        borderRadius: ROUNDING.md,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    previewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.lg,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    previewIconFrame: {
        width: 32,
        height: 32,
        borderRadius: ROUNDING.sm,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    modalOverlay: {
        position: 'absolute',
        top: 0, bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: SPACING.xl,
    } as any,
    modalContent: {
        width: '100%',
        maxWidth: 600,
        maxHeight: '80%',
        backgroundColor: COLORS.surface,
        borderRadius: ROUNDING.lg,
        padding: SPACING.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.floating,
    }
});
