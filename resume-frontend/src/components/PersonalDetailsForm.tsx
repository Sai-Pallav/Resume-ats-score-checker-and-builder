import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { globalStyles, TYPOGRAPHY, COLORS, SPACING, ROUNDING, SHADOWS } from '../styles/theme';

interface PersonalDetailsFormProps {
    fullName: string;
    setFullName: (v: string) => void;
    email: string;
    setEmail: (v: string) => void;
    phone: string;
    setPhone: (v: string) => void;
    location: string;
    setLocation: (v: string) => void;
    linkedin: string;
    setLinkedin: (v: string) => void;
}

const PersonalDetailsForm: React.FC<PersonalDetailsFormProps> = ({
    fullName, setFullName,
    email, setEmail,
    phone, setPhone,
    location, setLocation,
    linkedin, setLinkedin
}) => {
    return (
        <View style={styles.container}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg }}>
                <View style={styles.iconFrame}>
                    <MaterialCommunityIcons name="account-outline" size={20} color={COLORS.primary} />
                </View>
                <Text style={[TYPOGRAPHY.h2, { marginBottom: 0, marginLeft: SPACING.md }]}>Personal Details</Text>
            </View>

            <View style={{ gap: SPACING.lg }}>
                <View>
                    <Text style={TYPOGRAPHY.label}>Full Name <Text style={{ color: COLORS.error }}>*</Text></Text>
                    <TextInput
                        style={globalStyles.inputBase}
                        placeholder="John Doe"
                        placeholderTextColor={COLORS.textSecondary}
                        value={fullName}
                        onChangeText={setFullName}
                    />
                </View>
                <View style={styles.formRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={TYPOGRAPHY.label}>Email Address</Text>
                        <TextInput style={globalStyles.inputBase} value={email} onChangeText={setEmail} keyboardType="email-address" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={TYPOGRAPHY.label}>Phone Number</Text>
                        <TextInput style={globalStyles.inputBase} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                    </View>
                </View>
                <View style={styles.formRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={TYPOGRAPHY.label}>Location</Text>
                        <TextInput style={globalStyles.inputBase} value={location} onChangeText={setLocation} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={TYPOGRAPHY.label}>LinkedIn URL</Text>
                        <TextInput style={globalStyles.inputBase} value={linkedin} onChangeText={setLinkedin} />
                    </View>
                </View>
            </View>
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
    formRow: {
        flexDirection: 'row',
        gap: SPACING.md,
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

export default React.memo(PersonalDetailsForm);
