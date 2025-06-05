import React from 'react';
import { Modal, View, StyleSheet, useWindowDimensions, Platform } from 'react-native';

interface BookingModalPanelProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const BookingModalPanel: React.FC<BookingModalPanelProps> = ({ visible, onClose, children }) => {
    const { width } = useWindowDimensions();
    const isMobile = width < 600 || Platform.OS !== 'web';

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={!isMobile}
            onRequestClose={onClose}
        >
            <View style={[styles.overlay, !isMobile && styles.overlayPanel]}>
                <View style={isMobile ? styles.fullScreenModal : styles.sidePanel}>
                    {children}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlayPanel: {
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
    },
    fullScreenModal: {
        flex: 1,
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 0,
        paddingTop: 0,
        paddingHorizontal: 0,
        paddingBottom: 0,
    },
    sidePanel: {
        width: 420,
        maxWidth: '100%',
        height: '100%',
        backgroundColor: '#fff',
        borderTopLeftRadius: 18,
        borderBottomLeftRadius: 18,
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: { width: -2, height: 0 },
        elevation: 8,
        padding: 0,
    },
});

export default BookingModalPanel;

