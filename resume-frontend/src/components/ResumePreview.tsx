import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS, ROUNDING, SHADOWS, SPACING } from '../styles/theme';

interface ResumePreviewProps {
    previewHtml: string;
    loading: boolean;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ previewHtml, loading }) => {
    return (
        <View style={styles.container}>
            <View style={styles.canvasContainer}>
                {loading && (
                    <View style={styles.loaderOverlay}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                )}
                {/* @ts-ignore - iframe is handled via web environment and srcDoc */}
                <iframe
                    srcDoc={previewHtml}
                    style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        backgroundColor: '#fff'
                    }}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.xl,
    },
    canvasContainer: {
        width: '100%',
        height: '100%',
        aspectRatio: 1 / 1.414, // A4 aspect ratio
        backgroundColor: '#fff',
        ...SHADOWS.floating,
        borderRadius: ROUNDING.lg,
        overflow: 'hidden',
        position: 'relative',
    },
    loaderOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.3)',
        zIndex: 10,
        alignItems: 'center',
        justifyContent: 'center',
    }
});

export default React.memo(ResumePreview);
