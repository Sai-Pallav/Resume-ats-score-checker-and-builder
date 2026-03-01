import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { globalStyles, TYPOGRAPHY, COLORS, SPACING, ROUNDING, SHADOWS } from '../styles/theme';

interface SummaryEditorProps {
    summary: string;
    setSummary: (v: string) => void;
}

const SummaryEditor: React.FC<SummaryEditorProps> = ({ summary, setSummary }) => {
    return (
        <View style={styles.container}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg }}>
                <View style={styles.iconFrame}>
                    <MaterialCommunityIcons name="text-box-outline" size={20} color={COLORS.primary} />
                </View>
                <Text style={[TYPOGRAPHY.h2, { marginBottom: 0, marginLeft: SPACING.md }]}>Professional Summary</Text>
            </View>
            <TextInput
                style={[globalStyles.inputBase, { height: 120, textAlignVertical: 'top' }]}
                placeholder="Briefly describe your professional background and goals..."
                placeholderTextColor={COLORS.textSecondary}
                multiline
                value={summary}
                onChangeText={setSummary}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        borderRadius: ROUNDING.lg,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.card,
    },
    iconFrame: {
        width: 36,
        height: 36,
        borderRadius: ROUNDING.md,
        backgroundColor: COLORS.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    }
});

export default React.memo(SummaryEditor);
