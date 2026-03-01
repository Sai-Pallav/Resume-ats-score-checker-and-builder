import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, ROUNDING, SHADOWS, SPACING } from '../styles/theme';

interface ResumePreviewProps {
    previewHtml: string;
    loading: boolean;
}

// The base HTML that the iframe loads once. Updates are then injected via postMessage.
const BASE_IFRAME_HTML = `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  * { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0; width: 100%; height: 100%;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #fff;
  }
  #content {
    width: 100%;
    height: 100%;
    transition: opacity 0.25s ease;
  }
  #content.updating {
    opacity: 0.85;
  }
</style>
</head>
<body>
  <div id="content"></div>
  <script>
    window.addEventListener('message', function(event) {
      var el = document.getElementById('content');
      el.classList.add('updating');
      // Use requestAnimationFrame to ensure the fade starts before the content swap
      requestAnimationFrame(function() {
        el.innerHTML = event.data;
        // Use a small delay to allow the new content to paint before fading back in
        setTimeout(function() { el.classList.remove('updating'); }, 50);
      });
    });
  </script>
</body>
</html>`;

const ResumePreview: React.FC<ResumePreviewProps> = ({ previewHtml, loading }) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [iframeReady, setIframeReady] = useState(false);

    // When the iframe first loads, mark it as ready
    const handleIframeLoad = () => {
        setIframeReady(true);
    };

    // Whenever previewHtml changes and the iframe is ready, inject via postMessage
    useEffect(() => {
        if (iframeReady && iframeRef.current?.contentWindow && previewHtml) {
            iframeRef.current.contentWindow.postMessage(previewHtml, '*');
        }
    }, [previewHtml, iframeReady]);

    return (
        <View style={styles.container}>
            <View style={[styles.canvasContainer, loading && styles.canvasUpdating]}>
                {/* @ts-ignore - iframe runs in web environment */}
                <iframe
                    ref={iframeRef}
                    srcDoc={BASE_IFRAME_HTML}
                    onLoad={handleIframeLoad}
                    style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        backgroundColor: '#fff',
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
    canvasUpdating: {
        // Subtle visual indicator for loading without a harsh overlay
        opacity: 0.97,
    },
});

export default React.memo(ResumePreview);
