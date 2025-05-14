let _mockInventoryList = [
  {
    active: true,
    id: "SKU1",
    sku: "SKU1",
    name: "Ashwagandha Churna",
    brand: "Kottakkal",
    type: "Churna",
    unit: "gm",
    stock: 10,
    mrp: 110,
    buy_price: 80,
    gst: 5,
    expiry: "2025-11-01"
  },
  {
    active: true,
    id: "SKU2",
    sku: "SKU2",
    name: "Brahmi Oil",
    brand: "Arya Vaidya Sala",
    type: "Oil",
    unit: "ml",
    stock: 25,
    mrp: 250,
    buy_price: 200,
    gst: 12,
    expiry: "2025-09-15"
  },
  {
    active: true,
    id: "SKU3",
    sku: "SKU3",
    name: "Triphala Tablet",
    brand: "Dabur",
    type: "Tablet",
    unit: "tab",
    stock: 8,
    mrp: 90,
    buy_price: 65,
    gst: 5,
    expiry: "2024-12-30"
  },
  {
    active: true,
    id: "SKU4",
    sku: "SKU4",
    name: "Kumari Asava",
    brand: "Baidyanath",
    type: "Asava",
    unit: "ml",
    stock: 50,
    mrp: 180,
    buy_price: 140,
    gst: 12,
    expiry: "2026-01-10"
  }
];

export function getMockInventoryList() {
  // Return a deep copy to avoid mutation issues
  return _mockInventoryList.map(item => ({ ...item }));
}
