import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, TextInput, ScrollView, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { globalStyles, TYPOGRAPHY, COLORS, SPACING, ROUNDING, SHADOWS } from '../styles/theme';
import { api } from '../services/api';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function ResumeBuilderScreen({ navigation, route }: any) {
    const resumeId = route.params?.id;

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

    useEffect(() => {
        if (resumeId) {
            fetchResume();
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
            contactInfo: {
                fullName,
                email,
                phone,
                location,
                linkedin,
            },
            summary,
        };

        try {
            if (resumeId) {
                await api.put(`/resumes/${resumeId}`, payload);
                Alert.alert('Success', 'Resume updated successfully.');
            } else {
                const res = await api.post('/resumes', payload);
                navigation.replace('ResumeBuilder', { id: res.data.data.id });
                return;
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to save resume.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={[globalStyles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={globalStyles.safeArea}>
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="arrow-left" size={20} color={COLORS.secondary} />
                    <Text style={{ color: COLORS.secondary, fontWeight: '600', marginLeft: SPACING.xs }}>Dashboard</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[globalStyles.button, { paddingVertical: 10, paddingHorizontal: 20 }]}
                    onPress={saveResume}
                    disabled={saving}
                    activeOpacity={0.8}
                >
                    {saving ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <>
                            <Feather name="save" size={16} color={COLORS.surface} style={{ marginRight: SPACING.xs }} />
                            <Text style={[globalStyles.buttonText, { fontSize: 14 }]}>Save Changes</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView style={globalStyles.container} showsVerticalScrollIndicator={false}>
                <View style={globalStyles.webContentWrapper}>
                    <View style={globalStyles.content}>

                        <View style={{ marginBottom: SPACING.xl, marginTop: SPACING.md }}>
                            <Text style={TYPOGRAPHY.h1}>{resumeId ? 'Edit Profile' : 'New Resume'}</Text>
                            <Text style={TYPOGRAPHY.body1}>Manage your personal information and select a template.</Text>
                        </View>

                        {error && (
                            <View style={styles.errorBox}>
                                <Feather name="alert-circle" size={20} color={COLORS.error} />
                                <Text style={{ color: COLORS.error, marginLeft: SPACING.sm, flex: 1 }}>{error}</Text>
                            </View>
                        )}

                        <View style={globalStyles.card}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg }}>
                                <MaterialCommunityIcons name="cog-outline" size={24} color={COLORS.primary} />
                                <Text style={[TYPOGRAPHY.h3, { marginBottom: 0, marginLeft: SPACING.sm }]}>Document Settings</Text>
                            </View>

                            <Text style={TYPOGRAPHY.label}>Resume Title (Internal Tracking)</Text>
                            <TextInput
                                style={globalStyles.inputBase}
                                placeholder="e.g. Software Engineer 2026"
                                placeholderTextColor={COLORS.textSecondary}
                                value={title}
                                onChangeText={setTitle}
                            />

                            <Text style={[TYPOGRAPHY.label, { marginTop: SPACING.xl }]}>Template Design</Text>
                            <View style={{ flexDirection: 'row', gap: SPACING.md, flexWrap: 'wrap' }}>
                                {['classic', 'modern', 'minimal'].map(tpl => {
                                    const isActive = templateId === tpl;
                                    return (
                                        <TouchableOpacity
                                            key={tpl}
                                            style={[
                                                styles.templateButton,
                                                isActive && styles.templateButtonActive
                                            ]}
                                            onPress={() => setTemplateId(tpl)}
                                            activeOpacity={0.7}
                                        >
                                            {isActive && (
                                                <MaterialCommunityIcons name="check-circle" size={16} color={COLORS.primaryDark} style={{ marginRight: 6 }} />
                                            )}
                                            <Text style={[
                                                styles.templateButtonText,
                                                isActive && styles.templateButtonTextActive
                                            ]}>
                                                {tpl}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        <View style={globalStyles.card}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg }}>
                                <MaterialCommunityIcons name="account-outline" size={24} color={COLORS.primary} />
                                <Text style={[TYPOGRAPHY.h3, { marginBottom: 0, marginLeft: SPACING.sm }]}>Personal Details</Text>
                            </View>

                            <View style={{ gap: SPACING.lg }}>
                                <View>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={TYPOGRAPHY.label}>Full Name </Text>
                                        <Text style={{ color: COLORS.error }}>*</Text>
                                    </View>
                                    <TextInput style={globalStyles.inputBase} placeholder="John Doe" placeholderTextColor={COLORS.textSecondary} value={fullName} onChangeText={setFullName} />
                                </View>

                                <View style={styles.formRow}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={TYPOGRAPHY.label}>Email Address</Text>
                                        <TextInput style={globalStyles.inputBase} placeholder="john@example.com" placeholderTextColor={COLORS.textSecondary} value={email} onChangeText={setEmail} keyboardType="email-address" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={TYPOGRAPHY.label}>Phone Number</Text>
                                        <TextInput style={globalStyles.inputBase} placeholder="+1 (555) 000-0000" placeholderTextColor={COLORS.textSecondary} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                                    </View>
                                </View>

                                <View style={styles.formRow}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={TYPOGRAPHY.label}>Location</Text>
                                        <TextInput style={globalStyles.inputBase} placeholder="City, State" placeholderTextColor={COLORS.textSecondary} value={location} onChangeText={setLocation} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={TYPOGRAPHY.label}>LinkedIn URL</Text>
                                        <TextInput style={globalStyles.inputBase} placeholder="linkedin.com/in/johndoe" placeholderTextColor={COLORS.textSecondary} value={linkedin} onChangeText={setLinkedin} />
                                    </View>
                                </View>

                            </View>
                        </View>

                        <View style={globalStyles.card}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg }}>
                                <MaterialCommunityIcons name="text-box-outline" size={24} color={COLORS.primary} />
                                <Text style={[TYPOGRAPHY.h3, { marginBottom: 0, marginLeft: SPACING.sm }]}>Professional Summary</Text>
                            </View>
                            <TextInput
                                style={[globalStyles.inputBase, { height: 160, textAlignVertical: 'top' }]}
                                placeholder="Write a brief, impactful overview of your professional profile, key skills, and career objectives..."
                                placeholderTextColor={COLORS.textSecondary}
                                multiline
                                value={summary}
                                onChangeText={setSummary}
                            />
                        </View>

                        <View style={globalStyles.card}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg }}>
                                <MaterialCommunityIcons name="format-list-bulleted-type" size={24} color={COLORS.primary} />
                                <Text style={[TYPOGRAPHY.h3, { marginBottom: 0, marginLeft: SPACING.sm }]}>Resume Sections</Text>
                            </View>
                            <Text style={[TYPOGRAPHY.body1, { marginBottom: SPACING.lg }]}>
                                Add your Work Experience, Education, Skills, and Projects.
                            </Text>
                            <TouchableOpacity
                                style={[globalStyles.button, { backgroundColor: COLORS.secondary }]}
                                onPress={() => {
                                    if (resumeId) {
                                        navigation.navigate('ResumeSections', { id: resumeId, title: title || 'Untitled' });
                                    } else {
                                        Alert.alert('Save Required', 'Please save the resume first before adding sections.');
                                    }
                                }}
                                activeOpacity={0.8}
                            >
                                <MaterialCommunityIcons name="pencil-outline" size={20} color={COLORS.surface} style={{ marginRight: SPACING.sm }} />
                                <Text style={globalStyles.buttonText}>Edit Experience & Details</Text>
                            </TouchableOpacity>
                        </View>

                        {resumeId && (
                            <TouchableOpacity
                                style={[globalStyles.card, styles.exportPreviewCard]}
                                onPress={() => {
                                    // Make sure api base url is correct for linking out
                                    const baseUrl = api.defaults.baseURL || 'http://localhost:3000/api/v1';
                                    const pdfUrl = `${baseUrl}/resumes/${resumeId}/pdf?template=${templateId}`;
                                    // using window.open for web is safer, or Linking for native
                                    if (typeof window !== 'undefined') {
                                        window.open(pdfUrl, '_blank');
                                    } else {
                                        import('react-native').then(({ Linking }) => {
                                            Linking.openURL(pdfUrl);
                                        });
                                    }
                                }}
                                activeOpacity={0.8}
                            >
                                <MaterialCommunityIcons name="file-pdf-box" size={48} color={COLORS.primaryDark} />
                                <View style={{ flex: 1, marginLeft: SPACING.md }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <View>
                                            <Text style={TYPOGRAPHY.h3}>PDF Export Engine</Text>
                                            <Text style={TYPOGRAPHY.body2}>Download your high-definition resume.</Text>
                                        </View>
                                        <Feather name="download-cloud" size={24} color={COLORS.primaryDark} />
                                    </View>
                                </View>
                            </TouchableOpacity>
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
        justifyContent: 'space-between',
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
    formRow: {
        flexDirection: 'row',
        gap: SPACING.lg,
        flexWrap: 'wrap',
    },
    templateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        paddingVertical: 10,
        paddingHorizontal: SPACING.lg,
        borderRadius: ROUNDING.full,
    },
    templateButtonActive: {
        backgroundColor: COLORS.primaryLight,
        borderColor: COLORS.primaryDark,
        paddingLeft: SPACING.md,
    },
    templateButtonText: {
        color: COLORS.secondary,
        fontWeight: '600',
        textTransform: 'capitalize',
        fontSize: 15,
    },
    templateButtonTextActive: {
        color: COLORS.primaryDark,
        fontWeight: '800',
    },
    exportPreviewCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primaryLight,
        borderColor: 'rgba(67, 56, 202, 0.2)',
        borderWidth: 1,
        padding: SPACING.xl,
    },
    codeBlock: {
        backgroundColor: 'rgba(15, 23, 42, 0.05)',
        padding: SPACING.sm,
        borderRadius: ROUNDING.sm,
        marginTop: SPACING.sm,
        alignSelf: 'flex-start',
    },
    codeText: {
        fontFamily: 'monospace',
        color: COLORS.primaryDark,
        fontSize: 13,
        fontWeight: 'bold',
    }
});
