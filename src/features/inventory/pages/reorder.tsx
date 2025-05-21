import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { updateInventoryItem } from '@/redux/slices/inv.slice';
import type { RootState, AppDispatch } from '@/redux/store';

const ReorderListPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector((state: RootState) => state.inventory.inventoryList);
  // Use 'stock' instead of 'quantity', and fallback to index as key if no id
  const lowStock = items.filter(item => item.stock !== undefined && item.stock <= 5);
  const [reordered, setReordered] = React.useState<Array<string | number>>([]);

  const handleReorder = (item: typeof lowStock[0], index: number) => {
    const itemId = (item as any).id ?? index;
    setReordered(prev => [...prev, itemId]);
    // No 'reordered' field in InventoryItem, so just show alert for demo
    Alert.alert('Reordered', 'Marked as reordered!');
  };

  const renderItem = ({ item, index }: { item: typeof lowStock[0]; index: number }) => {
    const itemId = (item as any).id ?? index;
    return (
      <View style={styles.card}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemQty}>Stock: {item.stock}</Text>
        <TouchableOpacity
          style={[styles.btn, reordered.includes(index) && { backgroundColor: '#ccc' }]}
          onPress={() => handleReorder(item, index)}
          disabled={reordered.includes(index)}
        >
          <Text style={{ color: '#fff' }}>{reordered.includes(index) ? 'Reordered' : 'Mark as Reordered'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reorder List</Text>
      <FlatList
        data={lowStock}
        keyExtractor={(_item, index) => String(index)}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No items low in stock.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#222', marginBottom: 16, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 14, elevation: 2 },
  itemName: { fontSize: 18, fontWeight: '600', color: '#222' },
  itemQty: { color: '#333', fontWeight: '500', marginBottom: 8 },
  btn: { backgroundColor: '#4caf50', borderRadius: 8, padding: 10, alignItems: 'center' },
  empty: { color: '#aaa', textAlign: 'center', marginTop: 40 },
});

export default ReorderListPage;
