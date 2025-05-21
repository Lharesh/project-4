import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';

interface TooltipOverlayProps {
  tooltip: string | null;
  tooltipPos: { x: number; y: number } | null;
  style?: StyleProp<ViewStyle>;
  zIndex?: number;
  backgroundColor?: string;
  textColor?: string;
}

const TooltipOverlay: React.FC<TooltipOverlayProps> = ({
  tooltip,
  tooltipPos,
  style,
  zIndex = 99999,
  backgroundColor = '#222',
  textColor = '#fff',
}) => {
  if (!tooltip) return null;

  let tooltipStyle: ViewStyle = { alignSelf: 'center', zIndex };
  if (tooltipPos && typeof tooltipPos.x === 'number' && typeof tooltipPos.y === 'number') {
    tooltipStyle = {
      position: 'absolute',
      left: Math.max(tooltipPos.x - 50, 8),
      top: Math.max(tooltipPos.y - 52, 8),
      zIndex,
    };
  }

  return (
    <View style={[styles.tooltip, tooltipStyle, { backgroundColor }, style]} pointerEvents="none">
      <Text style={[styles.tooltipText, { color: textColor }]}>{tooltip}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tooltip: {
    padding: 8,
    borderRadius: 6,
    minWidth: 80,
    maxWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  tooltipText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default TooltipOverlay;