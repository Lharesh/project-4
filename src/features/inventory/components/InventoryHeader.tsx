import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, Platform, Pressable, ScrollView } from 'react-native';
import { Plus, Upload, GripVertical, XCircle } from 'lucide-react-native';
import TooltipPortal from './TooltipPortal';

// Web-only icon button style
const iconButtonWeb: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 42,
  height: 42,
  borderRadius: 21,
  background: 'linear-gradient(90deg, #2563eb 0%, #1e40af 100%)',
  marginLeft: 8,
  marginRight: 12,
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(30,64,175,0.08)',
  transition: 'box-shadow 0.2s',
};

interface InventoryHeaderProps {
  searchQuery: string;
  handleSearch: (text: string) => void;
  handleAdd: () => void;
  onUpload: () => void;
}

const InventoryHeader: React.FC<InventoryHeaderProps> = ({
  searchQuery,
  handleSearch,
  handleAdd,
  onUpload,
}) => {
  // Tooltip/modal state
  const [tooltip, setTooltip] = useState<null | 'add' | 'upload' | 'reorder'>(null);
  const [tooltipPos, setTooltipPos] = useState<{top: number, left: number} | null>(null);

  // Refs for icon positions (web: HTMLDivElement, native: View)
  const addRef = React.useRef<any>(null);
  const uploadRef = React.useRef<any>(null);
  const reorderRef = React.useRef<any>(null);

  // Helper to show tooltip at correct position
  const showTooltip = (type: 'add' | 'upload' | 'reorder', ref: React.RefObject<any>) => {
    if (Platform.OS === 'web' && ref.current && typeof ref.current.getBoundingClientRect === 'function') {
      const rect = ref.current.getBoundingClientRect();
      setTooltip(type);
      setTooltipPos({
        top: rect.top - 48, // 48px above icon
        left: rect.left + rect.width / 2,
      });
    } else {
      setTooltip(type);
      setTooltipPos(null);
    }
  };

  const hideTooltip = () => {
    setTooltip(null);
    setTooltipPos(null);
  };

  // Tooltip content
  const tooltipContent = {
    add: 'Add a new inventory item',
    upload: 'Upload inventory spreadsheet',
    reorder: 'Reorder inventory items',
  };

  return (
    <View style={styles.headerCard}>
      <View style={styles.row}>
        {/* Icons */}
        {Platform.OS === 'web' ? (
          <View style={styles.iconRow}>
            {/* Add Icon */}
            <div
              ref={addRef}
              style={iconButtonWeb}
              onMouseEnter={() => showTooltip('add', addRef)}
              onMouseLeave={hideTooltip}
              onClick={handleAdd}
              role="button"
              tabIndex={0}
              aria-label="Add New Item"
            >
              <Plus color="#fff" />
            </div>
            {/* Upload Icon */}
            <div
              ref={uploadRef}
              style={iconButtonWeb}
              onMouseEnter={() => showTooltip('upload', uploadRef)}
              onMouseLeave={hideTooltip}
              onClick={onUpload}
              role="button"
              tabIndex={0}
              aria-label="Upload Inventory"
            >
              <Upload color="#fff" />
            </div>
            {/* Reorder Icon */}
            <div
              ref={reorderRef}
              style={iconButtonWeb}
              onMouseEnter={() => showTooltip('reorder', reorderRef)}
              onMouseLeave={hideTooltip}
              onClick={() => showTooltip('reorder', reorderRef)}
              role="button"
              tabIndex={0}
              aria-label="Reorder Inventory"
            >
              <GripVertical color="#fff" />
            </div>
          </View>
        ) : (
          <View style={{ width: '100%', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', backgroundColor: '#e0f7fa', borderWidth: 2, borderColor: '#00796b' }}>
            <View style={[styles.iconRow, { marginBottom: 12, width: '100%', justifyContent: 'flex-start' }]}> 
              <Pressable
                ref={addRef}
                style={styles.iconButton}
                onPress={handleAdd}
                accessibilityLabel={'Add New Item'}
                onLongPress={() => showTooltip('add', addRef)}
                onPressOut={hideTooltip}
              >
                <Plus color="#fff" />
              </Pressable>
              <Pressable
                ref={uploadRef}
                style={styles.iconButton}
                onPress={onUpload}
                accessibilityLabel={'Upload Inventory'}
                onLongPress={() => showTooltip('upload', uploadRef)}
                onPressOut={hideTooltip}
              >
                <Upload color="#fff" />
              </Pressable>
              <Pressable
                ref={reorderRef}
                style={styles.iconButton}
                onPress={() => showTooltip('reorder', reorderRef)}
                accessibilityLabel={'Reorder Inventory'}
                onLongPress={() => showTooltip('reorder', reorderRef)}
                onPressOut={hideTooltip}
              >
                <GripVertical color="#fff" />
              </Pressable>
            </View>
          </View>
        )}
        {/* Search bar */}
        <View style={styles.searchBarRow}>
          <TextInput
            placeholder="Search inventory..."
            value={searchQuery}
            onChangeText={handleSearch}
            style={styles.searchBar}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => handleSearch('')} style={styles.clearButton}>
              <XCircle color="#888" size={18} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      {/* Tooltips: absolutely positioned above each icon */}
      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, pointerEvents: 'box-none' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', width: '100%' }}>
          {/* Add Tooltip */}
          <View style={{ width: 42, alignItems: 'center', position: 'relative' }}>
            {tooltip === 'add' && tooltipPos && (
              <TooltipPortal style={{ position: 'fixed', top: tooltipPos.top, left: tooltipPos.left, transform: 'translateX(-50%)' }}>
                <View style={styles.tooltipContainer}>
                  <Text style={styles.tooltipText}>{tooltipContent.add}</Text>
                </View>
              </TooltipPortal>
            )}
          </View>
          {/* Upload Tooltip */}
          <View style={{ width: 42, alignItems: 'center', position: 'relative' }}>
            {tooltip === 'upload' && tooltipPos && (
              <TooltipPortal style={{ position: 'fixed', top: tooltipPos.top, left: tooltipPos.left, transform: 'translateX(-50%)' }}>
                <View style={styles.tooltipContainer}>
                  <Text style={styles.tooltipText}>{tooltipContent.upload}</Text>
                </View>
              </TooltipPortal>
            )}
          </View>
          {/* Reorder Tooltip */}
          <View style={{ width: 42, alignItems: 'center', position: 'relative' }}>
            {tooltip === 'reorder' && tooltipPos && (
              <TooltipPortal style={{ position: 'fixed', top: tooltipPos.top, left: tooltipPos.left, transform: 'translateX(-50%)' }}>
                <View style={styles.tooltipContainer}>
                  <Text style={styles.tooltipText}>{tooltipContent.reorder}</Text>
                </View>
              </TooltipPortal>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerCard: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    backgroundColor: Platform.OS === 'web' ? '#fff' : '#e0f7fa',
    padding: 10,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 30,
    alignItems: Platform.OS === 'web' ? 'center' : 'stretch',
    justifyContent: 'space-between',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxWidth: Platform.OS === 'web' ? 1100 : '100%',
    width: Platform.OS === 'web' ? 1100 : '100%',
    overflow: 'visible',
  },
  row: {
    flex: 1,
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    alignItems: Platform.OS === 'web' ? 'center' : 'stretch',
    justifyContent: 'space-between',
    width: '100%',
  },
  iconRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Platform.OS === 'web' ? 0 : 10,
    width: Platform.OS === 'web' ? undefined : '100%',
    justifyContent: Platform.OS === 'web' ? 'flex-start' : 'center',
  },
  iconButton: {
    backgroundColor: '#1976D2',
    padding: 8,
    borderRadius: 6,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    width: 32,
  },
  searchBarRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'row',
    alignItems: 'center',
    marginLeft: Platform.OS === 'web' ? 32 : 0,
    width: Platform.OS === 'web' ? undefined : '100%',
    marginBottom: Platform.OS === 'web' ? 0 : 8,
    justifyContent: Platform.OS === 'web' ? 'flex-start' : 'center',
  },
  searchBar: {
    minWidth: Platform.OS === 'web' ? 180 : 0,
    width: Platform.OS === 'web' ? 220 : '100%',
    padding: 8,
    borderRadius: 6,
    borderWidth: 0,
    fontSize: 15,
    backgroundColor: 'transparent',
    height: 30,
    flex: Platform.OS === 'web' ? undefined : 1,
  },
  clearButton: {
    marginLeft: 4,
  },
  tooltipContainer: {
    position: 'absolute',
    top: -38,
    left: 0,
    right: 0,
    backgroundColor: '#222',
    borderColor: '#fff',
    borderWidth: 2,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 240,
    minWidth: 120,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.26,
    shadowRadius: 8,
    elevation: 12,
  },
  tooltipText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default InventoryHeader;
