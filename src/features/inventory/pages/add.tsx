import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { addInventoryItem, updateInventoryItem } from '../inventorySlice';
import type { AppDispatch, RootState } from '../../../redux/store';

import { useLocalSearchParams } from 'expo-router';
import { InventoryItem } from '../types/inventory';

const AddEditInventoryPage = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const loading = useSelector((state: RootState) => state.inventory.loading);
  const inventoryList = useSelector((state: RootState) => state.inventory.inventoryList);

  // Find item if editing
  const editingItem = id ? inventoryList.find((item: InventoryItem) => item.id === id) : null;
  const [sku, setSku] = useState(editingItem ? editingItem.sku : '');
const [active, setActive] = useState(editingItem ? editingItem.active : true);
const [name, setName] = useState(editingItem ? editingItem.name : '');
  const [brand, setBrand] = useState(editingItem ? editingItem.brand : '');
  const [type, setType] = useState(editingItem ? editingItem.type : '');
  const [unit, setUnit] = useState(editingItem ? editingItem.unit : '');
  const [stock, setStock] = useState(editingItem ? String(editingItem.stock) : '');
  const [mrp, setMrp] = useState(editingItem ? String(editingItem.mrp) : '');
  const [buyPrice, setBuyPrice] = useState(editingItem ? String(editingItem.buy_price) : '');
  const [gst, setGst] = useState(editingItem ? String(editingItem.gst) : '');
  const [expiry, setExpiry] = useState(editingItem ? editingItem.expiry : '');

  const handleSave = async () => {
    if (!name.trim() || isNaN(Number(stock)) || Number(stock) < 0) {
      Alert.alert('Error', 'Please enter a valid name and non-negative stock.');
      return;
    }
    const item: InventoryItem = {
      id: editingItem ? editingItem.id : Math.random().toString(36).substring(2, 10), // or use uuid
      sku: sku || 'SKU-' + Math.floor(Math.random() * 100000),
      active,
      name,
      brand,
      type,
      unit,
      stock: Number(stock),
      mrp: Number(mrp),
      buy_price: Number(buyPrice),
      gst: Number(gst),
      expiry,
    };
    try {
      if (editingItem && id) {
        await dispatch(updateInventoryItem({ id, data: item })).unwrap();
      } else {
        await dispatch(addInventoryItem(item)).unwrap();
      }
      Alert.alert('Success', 'Inventory item saved!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (e) {
      Alert.alert('Error', 'Failed to save item.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{editingItem ? 'Edit' : 'Add'} Inventory Item</Text>
      <TextInput placeholder="SKU" value={sku} onChangeText={setSku} style={styles.input} />
<TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Brand" value={brand} onChangeText={setBrand} style={styles.input} />
      <TextInput placeholder="Type" value={type} onChangeText={setType} style={styles.input} />
      <TextInput placeholder="Unit" value={unit} onChangeText={setUnit} style={styles.input} />
      <TextInput placeholder="Stock" value={stock} onChangeText={setStock} style={styles.input} keyboardType="numeric" />
      <TextInput placeholder="MRP" value={mrp} onChangeText={setMrp} style={styles.input} keyboardType="numeric" />
      <TextInput placeholder="Buy Price" value={buyPrice} onChangeText={setBuyPrice} style={styles.input} keyboardType="numeric" />
      <TextInput placeholder="GST" value={gst} onChangeText={setGst} style={styles.input} keyboardType="numeric" />
      <TextInput placeholder="Expiry (yyyy-mm-dd)" value={expiry} onChangeText={setExpiry} style={styles.input} />
<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
  <Text style={{ marginRight: 8 }}>Active:</Text>
  <TouchableOpacity onPress={() => setActive(!active)} style={{ padding: 8, backgroundColor: active ? '#4caf50' : '#ccc', borderRadius: 4 }}>
    <Text style={{ color: '#fff' }}>{active ? 'Yes' : 'No'}</Text>
  </TouchableOpacity>
</View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.btn, { backgroundColor: '#ccc' }]}> 
          <Text>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSave} style={[styles.btn, { backgroundColor: '#4caf50' }]} disabled={loading}>
          <Text style={{ color: '#fff' }}>{loading ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7', padding: 16, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#222', marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 12 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  btn: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 8 },
});

export default AddEditInventoryPage;
