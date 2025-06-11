import { Slot } from 'expo-router';
import { View, Platform } from 'react-native';
import { webFullscreenOverlayStyle, webFullscreenContainerStyle } from './ModalLayout.styles';

export default function ModalLayout() {
    if (Platform.OS === 'web') {
        return (
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    zIndex: 1000,
                    background: 'rgba(0,0,0,0.35)',
                }}
            >
                <div
                    style={{
                        background: '#fff',
                        width: '100vw',
                        height: '100vh',
                        borderRadius: 0,
                        boxShadow: 'none',
                        padding: 0,
                        position: 'relative',
                        overflow: 'auto',
                    }}
                >
                    <Slot />
                </div>
            </div>
        );
    }
    // Native (mobile/tablet)
    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <Slot />
        </View>
    );
}