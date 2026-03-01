import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { globalStyles, COLORS, SPACING, ROUNDING, SHADOWS, TYPOGRAPHY } from '../styles/theme';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';

export type TemplateType = 'classic' | 'modern' | 'minimal' | 'professional' | 'creative' | 'executive' | 'startup' | 'academic';

interface TemplateThumbnailProps {
    type: TemplateType;
    isActive: boolean;
    onPress: () => void;
}

export default function TemplateThumbnail({ type, isActive, onPress }: TemplateThumbnailProps) {
    const renderThumbnailContent = () => {
        switch (type) {
            case 'classic':
                return (
                    <View style={styles.thumbnailInner}>
                        <View style={styles.classicHeader} />
                        <View style={styles.line} />
                        <View style={styles.classicSection} />
                        <View style={styles.classicSectionLarge} />
                    </View>
                );
            case 'modern':
                return (
                    <View style={[styles.thumbnailInner, { flexDirection: 'row' }]}>
                        {/* Left column sidebar */}
                        <View style={styles.modernSidebar} />
                        {/* Right column main content */}
                        <View style={styles.modernMain}>
                            <View style={styles.modernHeader} />
                            <View style={styles.modernSection} />
                            <View style={styles.modernSectionLarge} />
                        </View>
                    </View>
                );
            case 'minimal':
                return (
                    <View style={[styles.thumbnailInner, { padding: 4 }]}>
                        <View style={styles.minimalHeader} />
                        <View style={styles.minimalSectionTitle} />
                        <View style={styles.minimalSection} />
                        <View style={styles.minimalSection} />
                        <View style={styles.minimalSectionTitle} />
                        <View style={styles.minimalSection} />
                    </View>
                );
            case 'professional':
                return (
                    <View style={[styles.thumbnailInner, { padding: 6 }]}>
                        <View style={styles.profHeader} />
                        <View style={styles.profSection} />
                        <View style={styles.profSection} />
                        <View style={styles.profLine} />
                        <View style={styles.profSection} />
                        <View style={styles.profSection} />
                    </View>
                );
            case 'creative':
                return (
                    <View style={[styles.thumbnailInner, { flexDirection: 'row' }]}>
                        <View style={styles.creativeSidebar} />
                        <View style={styles.creativeMain}>
                            <View style={styles.creativeSection} />
                            <View style={styles.creativeSectionLarge} />
                        </View>
                    </View>
                );
            case 'executive':
                return (
                    <View style={[styles.thumbnailInner, { alignItems: 'center', padding: 6 }]}>
                        <View style={styles.execHeader} />
                        <View style={styles.execLine} />
                        <View style={styles.execSectionTitle} />
                        <View style={styles.execSection} />
                        <View style={styles.execSectionTitle} />
                        <View style={styles.execSection} />
                    </View>
                );
            case 'startup':
                return (
                    <View style={[styles.thumbnailInner, { padding: 4 }]}>
                        <View style={styles.startupHeader} />
                        <View style={{ flexDirection: 'row', flex: 1 }}>
                            <View style={styles.startupMain}>
                                <View style={styles.startupSection} />
                                <View style={styles.startupSectionLarge} />
                            </View>
                            <View style={styles.startupSidebar}>
                                <View style={styles.startupSection} />
                                <View style={styles.startupSection} />
                            </View>
                        </View>
                    </View>
                );
            case 'academic':
                return (
                    <View style={[styles.thumbnailInner, { padding: 2 }]}>
                        <View style={styles.academicHeader} />
                        <View style={styles.academicSectionTitle} />
                        <View style={styles.academicSectionLine} />
                        <View style={styles.academicSectionLine} />
                        <View style={styles.academicSectionLine} />
                        <View style={styles.academicSectionTitle} />
                        <View style={styles.academicSectionLine} />
                        <View style={styles.academicSectionLine} />
                        <View style={styles.academicSectionLine} />
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.container,
                isActive ? styles.containerActive : null
            ]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={[styles.visualBox, isActive ? styles.visualBoxActive : null]}>
                {renderThumbnailContent()}
                {isActive && (
                    <View style={styles.checkBadge}>
                        <MaterialCommunityIcons name="check-circle" size={16} color={COLORS.surface} />
                    </View>
                )}
            </View>
            <Text style={[styles.title, isActive ? styles.titleActive : null]}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginRight: SPACING.lg,
        width: 120, // Fixed width for scrollable cards
    },
    containerActive: {
        transform: [{ scale: 1.02 }],
    },
    visualBox: {
        width: '100%',
        aspectRatio: 1 / 1.414, // A4 ratio (or US Letter approximation)
        backgroundColor: COLORS.surface,
        borderRadius: ROUNDING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 8,
        ...SHADOWS.card,
        marginBottom: SPACING.sm,
        position: 'relative',
    },
    visualBoxActive: {
        borderColor: COLORS.primary,
        borderWidth: 2,
        ...SHADOWS.floating,
    },
    checkBadge: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: COLORS.primary,
        borderRadius: ROUNDING.full,
        padding: 2,
        borderWidth: 2,
        borderColor: COLORS.surface,
        ...SHADOWS.button,
    },
    title: {
        ...TYPOGRAPHY.label,
        color: COLORS.textSecondary,
        marginBottom: 0,
        textTransform: 'none',
    },
    titleActive: {
        color: COLORS.primaryDark,
        fontWeight: '800',
    },
    thumbnailInner: {
        flex: 1,
        backgroundColor: COLORS.background,
        borderRadius: 2,
        overflow: 'hidden',
    },
    // Classic specific
    classicHeader: {
        height: 12,
        width: '50%',
        backgroundColor: COLORS.secondary,
        alignSelf: 'center',
        marginTop: 8,
        borderRadius: 1,
    },
    line: {
        height: 1,
        width: '80%',
        backgroundColor: COLORS.border,
        alignSelf: 'center',
        marginVertical: 4,
    },
    classicSection: {
        height: 6,
        width: '80%',
        backgroundColor: COLORS.textSecondary,
        alignSelf: 'center',
        marginBottom: 4,
        borderRadius: 1,
    },
    classicSectionLarge: {
        height: 16,
        width: '80%',
        backgroundColor: COLORS.border,
        alignSelf: 'center',
        borderRadius: 1,
    },
    // Modern specific
    modernSidebar: {
        width: '30%',
        height: '100%',
        backgroundColor: COLORS.primaryDark, // Strong left color
    },
    modernMain: {
        flex: 1,
        paddingLeft: 4,
        paddingTop: 8,
    },
    modernHeader: {
        height: 8,
        width: '60%',
        backgroundColor: COLORS.secondary,
        marginBottom: 6,
        borderRadius: 1,
    },
    modernSection: {
        height: 4,
        width: '80%',
        backgroundColor: COLORS.textSecondary,
        marginBottom: 3,
        borderRadius: 1,
    },
    modernSectionLarge: {
        height: 12,
        width: '90%',
        backgroundColor: COLORS.border,
        borderRadius: 1,
    },
    // Minimal specific
    minimalHeader: {
        height: 6,
        width: '40%',
        backgroundColor: COLORS.secondary,
        marginTop: 6,
        marginBottom: 8,
        borderRadius: 1,
    },
    minimalSectionTitle: {
        height: 4,
        width: '30%',
        backgroundColor: COLORS.primary,
        marginBottom: 4,
        marginTop: 4,
        borderRadius: 1,
    },
    minimalSection: {
        height: 3,
        width: '90%',
        backgroundColor: COLORS.textSecondary,
        marginBottom: 2,
        borderRadius: 1,
        opacity: 0.6,
    },
    // Professional specific
    profHeader: {
        height: 8,
        width: '70%',
        backgroundColor: '#1a5276',
        marginBottom: 8,
        borderRadius: 1,
    },
    profSection: {
        height: 4,
        width: '100%',
        backgroundColor: COLORS.textSecondary,
        marginBottom: 4,
        borderRadius: 1,
    },
    profLine: {
        height: 1,
        width: '100%',
        backgroundColor: COLORS.border,
        marginVertical: 4,
    },
    // Creative specific
    creativeSidebar: {
        width: '25%',
        height: '100%',
        backgroundColor: '#ff6b6b',
    },
    creativeMain: {
        flex: 1,
        paddingLeft: 4,
        paddingTop: 8,
    },
    creativeSection: {
        height: 6,
        width: '70%',
        backgroundColor: '#ff6b6b',
        marginBottom: 6,
        borderRadius: 1,
    },
    creativeSectionLarge: {
        height: 14,
        width: '90%',
        backgroundColor: COLORS.border,
        borderRadius: 1,
        borderLeftWidth: 2,
        borderLeftColor: '#eee',
    },
    // Executive specific
    execHeader: {
        height: 10,
        width: '60%',
        backgroundColor: '#222',
        marginBottom: 4,
        borderRadius: 1,
    },
    execLine: {
        height: 1,
        width: '80%',
        backgroundColor: '#222',
        marginBottom: 8,
    },
    execSectionTitle: {
        height: 4,
        width: '40%',
        backgroundColor: '#000',
        marginBottom: 4,
        marginTop: 4,
        borderRadius: 1,
    },
    execSection: {
        height: 3,
        width: '90%',
        backgroundColor: COLORS.textSecondary,
        marginBottom: 2,
        borderRadius: 1,
    },
    // Startup specific
    startupHeader: {
        height: 10,
        width: '100%',
        borderBottomWidth: 2,
        borderBottomColor: '#6366f1',
        marginBottom: 6,
    },
    startupMain: {
        flex: 6.5,
    },
    startupSidebar: {
        flex: 3.5,
        borderLeftWidth: 1,
        borderLeftColor: COLORS.border,
        paddingLeft: 2,
    },
    startupSection: {
        height: 4,
        width: '80%',
        backgroundColor: '#4f46e5',
        marginBottom: 4,
        marginTop: 2,
        borderRadius: 1,
    },
    startupSectionLarge: {
        height: 12,
        width: '90%',
        backgroundColor: COLORS.border,
        borderRadius: 1,
    },
    // Academic specific
    academicHeader: {
        height: 6,
        width: '50%',
        backgroundColor: '#000',
        alignSelf: 'center',
        marginBottom: 4,
        marginTop: 2,
        borderRadius: 1,
    },
    academicSectionTitle: {
        height: 3,
        width: '30%',
        backgroundColor: '#000',
        marginBottom: 2,
        marginTop: 2,
        borderRadius: 1,
    },
    academicSectionLine: {
        height: 2,
        width: '95%',
        backgroundColor: COLORS.textSecondary,
        marginBottom: 1,
        borderRadius: 1,
        opacity: 0.8,
    }
});
