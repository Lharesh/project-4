// services/inventoryService.ts
import type { InventoryItem } from '../types/inventory';
import { getMockInventoryList } from '../mock/inv.mock';

// Stateful in-memory mock list
let mockInventoryList: InventoryItem[] = getMockInventoryList();

export const inventoryService = {
  async getInventoryItems(limit = 20, startAfter?: string): Promise<InventoryItem[]> {
    // Pagination mock (ignoring startAfter)
    return mockInventoryList.slice(0, limit);
  },

  async addItem(item: InventoryItem): Promise<InventoryItem> {
    const id = item.id?.trim() || Math.random().toString(36).substring(2, 10);
    const newItem = { ...item, id };
    mockInventoryList.push(newItem);
    return newItem;
  },

  async editItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    const idx = mockInventoryList.findIndex((item) => item.id === id);
    if (idx === -1) throw new Error(`Item with id ${id} not found`);
    const updatedItem = { ...mockInventoryList[idx], ...updates };
    mockInventoryList[idx] = updatedItem;
    return updatedItem;
  },

  async removeItem(id: string): Promise<string> {
    const idx = mockInventoryList.findIndex((item) => item.id === id);
    if (idx === -1) throw new Error(`Item with id ${id} not found`);
    mockInventoryList.splice(idx, 1);
    return id;
  },

  async uploadValidRecords(rows: InventoryItem[]): Promise<{ success: boolean; count: number }> {
    mockInventoryList.push(...rows);
    return { success: true, count: rows.length };
  },

  async clearInventory(): Promise<{ success: boolean }> {
    mockInventoryList = [];
    return { success: true };
  }
};