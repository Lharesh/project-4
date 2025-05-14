import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';

// Only import createPortal on web
let createPortal: any = null;
if (Platform.OS === 'web') {
  // @ts-ignore
  createPortal = require('react-dom').createPortal;
}

interface TooltipPortalProps {
  children: React.ReactNode;
  style?: any;
}

const TooltipPortal: React.FC<TooltipPortalProps> = ({ children, style }) => {
  if (Platform.OS === 'web' && createPortal) {
    // Render to body for web
    return createPortal(
      <div style={{ position: 'fixed', zIndex: 3000, ...style }}>{children}</div>,
      document.body
    );
  }
  // Native fallback: just render in place
  return <View style={[styles.native, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  native: {
    position: 'absolute',
    zIndex: 3000,
  },
});

export default TooltipPortal;
