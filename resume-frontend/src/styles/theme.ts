import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Premium Professional Palette (Modern Corporate Light Mode)
export const COLORS = {
    primary: '#4338CA', // Indigo 700 - Deep, professional accent
    primaryDark: '#312E81', // Indigo 900
    primaryLight: '#EEF2FF', // Indigo 50
    secondary: '#0F172A', // Slate 900 - High contrast text/headers
    background: '#F8FAFC', // Slate 50 - Ultra-clean subtle off-white
    surface: '#FFFFFF', // Crisp white cards
    text: '#1E293B', // Slate 800 - Highly readable body
    textSecondary: '#64748B', // Slate 500 - Sophisticated muted text
    border: '#E2E8F0', // Slate 200 - Clean, crisp borders
    error: '#DC2626',
    errorBg: '#FEF2F2',
    success: '#059669',
    successBg: '#ECFDF5',
    warning: '#D97706',
    warningBg: '#FFFBEB',
    surfaceGradient1: '#FFFFFF',
    surfaceGradient2: '#F8FAFC',
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const ROUNDING = {
    sm: 8,
    md: 12,
    lg: 20,
    xl: 32,
    full: 9999,
};

export const TYPOGRAPHY = StyleSheet.create({
    h1: { fontSize: 40, fontWeight: '800', color: COLORS.secondary, letterSpacing: -1, marginBottom: SPACING.md, lineHeight: 48 },
    h2: { fontSize: 32, fontWeight: '700', color: COLORS.secondary, letterSpacing: -0.5, marginBottom: SPACING.sm, lineHeight: 40 },
    h3: { fontSize: 22, fontWeight: '600', color: COLORS.secondary, marginBottom: SPACING.sm, letterSpacing: -0.3 },
    h4: { fontSize: 15, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 1.2 },
    body1: { fontSize: 17, color: COLORS.text, lineHeight: 28, fontWeight: '400' },
    body2: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 24, fontWeight: '400' },
    caption: { fontSize: 13, color: COLORS.textSecondary, letterSpacing: 0.3, fontWeight: '500' },
    label: { fontSize: 14, fontWeight: '700', color: COLORS.secondary, marginBottom: SPACING.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
});

export const SHADOWS = StyleSheet.create(Platform.select({
    web: {
        card: { boxShadow: '0px 10px 25px -5px rgba(15, 23, 42, 0.05), 0px 8px 10px -6px rgba(15, 23, 42, 0.01)' } as any,
        button: { boxShadow: '0px 4px 14px rgba(67, 56, 202, 0.25)' } as any,
        floating: { boxShadow: '0px 20px 40px -4px rgba(15, 23, 42, 0.1)' } as any,
    },
    default: {
        card: {
            shadowColor: COLORS.secondary,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.06,
            shadowRadius: 16,
            elevation: 4,
        },
        button: {
            shadowColor: COLORS.primary,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 6,
        },
        floating: {
            shadowColor: COLORS.secondary,
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.12,
            shadowRadius: 24,
            elevation: 10,
        }
    }
}) as any);

export const METRICS = {
    screenWidth: width,
    screenHeight: height,
    maxWidth: 900, // Slightly wider for a more desktop-native feel
    isLargeScreen: width > 800,
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
        padding: SPACING.xl, // Increase padding for a more spacious, premium feel
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: ROUNDING.lg,
        padding: SPACING.xl,
        ...SHADOWS.card,
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: 'rgba(226, 232, 240, 0.6)', // Extremely subtle border
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        paddingHorizontal: SPACING.xl,
        borderRadius: ROUNDING.md, // More professional than perfectly round
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.button,
        flexDirection: 'row',
    },
    buttonDisabled: {
        backgroundColor: COLORS.border,
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonText: {
        color: COLORS.surface,
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    buttonOutline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: COLORS.primary,
        paddingVertical: 14,
        paddingHorizontal: SPACING.xl,
        borderRadius: ROUNDING.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonOutlineText: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    inputBase: {
        backgroundColor: '#F8FAFC', // Slightly offset from card white
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: ROUNDING.md,
        padding: 16,
        fontSize: 16,
        color: COLORS.secondary,
        fontWeight: '500',
    },
    inputFocus: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.surface,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: ROUNDING.full,
        backgroundColor: COLORS.primaryLight,
    },
    badgeText: {
        color: COLORS.primaryDark,
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    }
});
