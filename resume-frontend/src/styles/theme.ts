import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Simple & Attractive Light Palette
export const COLORS = {
    primary: '#6366F1', // Elegant Indigo
    primaryDark: '#4F46E5',
    primaryLight: '#EEF2FF',
    accent: '#F472B6',
    secondary: '#0F172A', // Slate 900 for sharp text
    background: '#F8FAFC', // Slate 50 - Very clean, slightly cool white
    surface: '#FFFFFF',
    text: '#334155', // Slate 700 - Better contrast than 600
    textSecondary: '#64748B', // Slate 500
    border: '#E2E8F0', // Slate 200 - Defined but light
    error: '#EF4444',
    errorBg: '#FEF2F2',
    success: '#10B981',
    successBg: '#F0FDF4',
    warning: '#F59E0B',
    warningBg: '#FFFBEB',
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 20,
    xl: 32,
    xxl: 48,
};

export const ROUNDING = {
    sm: 6,
    md: 10,
    lg: 16,
    xl: 24,
    full: 9999,
};

export const TYPOGRAPHY = StyleSheet.create({
    h1: { fontSize: 32, fontWeight: '800', color: COLORS.secondary, letterSpacing: -0.8, marginBottom: SPACING.md, lineHeight: 40, fontFamily: Platform.OS === 'web' ? 'Outfit, sans-serif' : undefined },
    h2: { fontSize: 22, fontWeight: '700', color: COLORS.secondary, letterSpacing: -0.4, marginBottom: SPACING.sm, lineHeight: 28 },
    h3: { fontSize: 18, fontWeight: '600', color: COLORS.secondary, marginBottom: SPACING.xs },
    h4: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: SPACING.xs },
    body1: { fontSize: 15, color: COLORS.text, lineHeight: 24, fontWeight: '400' },
    body2: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22, fontWeight: '400' },
    caption: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
    label: { fontSize: 14, fontWeight: '600', color: COLORS.secondary, marginBottom: 6 },
});

export const SHADOWS = StyleSheet.create(Platform.select({
    web: {
        card: { boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)' } as any,
        button: { boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' } as any,
        floating: { boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' } as any,
        premium: { boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' } as any,
        glass: { boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' } as any, // Simplified glass
    },
    default: {
        card: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
        },
        button: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
        }
    }
}) as any);

export const METRICS = {
    screenWidth: width,
    screenHeight: height,
    maxWidth: 1100,
    isLargeScreen: width > 900,
};

export const globalStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flex: 1,
    },
    webContentWrapper: {
        flex: 1,
        width: '100%',
        maxWidth: METRICS.maxWidth,
        alignSelf: 'center',
    },
    content: {
        padding: SPACING.lg,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: ROUNDING.md,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.card,
        marginBottom: SPACING.lg,
    },
    glassCard: {
        backgroundColor: COLORS.surface, // Solid background now
        borderRadius: ROUNDING.lg,
        padding: SPACING.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.card,
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: SPACING.lg,
        borderRadius: ROUNDING.md,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    buttonPrimary: {
        backgroundColor: COLORS.primary,
    },
    buttonPrimaryText: {
        color: COLORS.surface,
        fontSize: 15,
        fontWeight: '600',
    },
    inputBase: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: ROUNDING.sm,
        padding: 12,
        fontSize: 15,
        color: COLORS.secondary,
    },
    inputFocus: {
        borderColor: COLORS.primary,
        backgroundColor: '#FFFFFF',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: ROUNDING.full,
        backgroundColor: COLORS.primaryLight,
    },
    badgeText: {
        color: COLORS.primaryDark,
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
    }
});
