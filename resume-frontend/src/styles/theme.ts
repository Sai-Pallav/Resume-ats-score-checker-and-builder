import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Premium & Professional Light Palette
export const COLORS = {
    primary: '#1E293B', // Deep Slate for a serious professional look
    primaryDark: '#0F172A',
    primaryLight: '#F1F5F9',
    accent: '#3B82F6', // Blue 500 for subtle highlights
    secondary: '#334155', // Slate 700 for text
    background: '#FFFFFF', // Pure White for maximal simplicity
    surface: '#FFFFFF',
    text: '#475569', // Slate 600 - softer for heavy reading
    textSecondary: '#94A3B8', // Slate 400
    border: '#CBD5E1', // More distinct slate for visible borders
    error: '#DC2626',
    errorBg: '#FEF2F2',
    success: '#059669',
    successBg: '#ECFDF5',
    warning: '#D97706',
    warningBg: '#FFFBEB',
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 40,
    xxl: 64,
};

export const ROUNDING = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
};

export const TYPOGRAPHY = StyleSheet.create({
    h1: { fontSize: 32, fontWeight: '700', color: COLORS.primary, letterSpacing: -0.5, marginBottom: SPACING.md, lineHeight: 40 },
    h2: { fontSize: 24, fontWeight: '600', color: COLORS.primary, letterSpacing: -0.2, marginBottom: SPACING.sm, lineHeight: 32 },
    h3: { fontSize: 18, fontWeight: '600', color: COLORS.secondary, marginBottom: SPACING.xs },
    h4: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: SPACING.xs },
    body1: { fontSize: 16, color: COLORS.text, lineHeight: 26, fontWeight: '400' },
    body2: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22, fontWeight: '400' },
    caption: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
    label: { fontSize: 14, fontWeight: '600', color: COLORS.primary, marginBottom: 8 },
});

export const SHADOWS = StyleSheet.create(Platform.select({
    web: {
        card: { boxShadow: '0 0 0 1px rgba(0,0,0,0.1)' } as any, // Darker border-like shadow
        button: { boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' } as any,
        floating: { boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' } as any,
        premium: { boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' } as any,
        glass: { boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' } as any,
    },
    default: {
        card: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
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
