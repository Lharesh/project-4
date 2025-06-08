import React, { useState, useEffect } from 'react';
import { Modal, View, StyleSheet, useWindowDimensions, Platform, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

interface BookingModalPanelProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const BookingModalPanel: React.FC<BookingModalPanelProps> = ({ visible, onClose, children }) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 600 || Platform.OS !== 'web';
  const { tab } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState(tab || 'Doctor');

  useEffect(() => {
    if (tab) setActiveTab(tab);
  }, [tab]);

  useEffect(() => {
    console.log('[BookingModalPanel] rendered, visible:', visible, 'Platform:', Platform.OS);
  }, [visible]);

  if (Platform.OS === 'web') {
    if (!visible) return null;
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
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'stretch',
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
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  // Native (mobile/tablet)
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

