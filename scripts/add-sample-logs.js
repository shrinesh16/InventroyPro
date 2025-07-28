// This script adds sample logs for today to test the PDF export functionality
// In a real application, this would be handled by the backend

const sampleLogsForToday = [
  {
    id: "today-1",
    productName: "iPhone 15 Pro",
    action: "add",
    quantity: 25,
    previousStock: 25,
    newStock: 50,
    user: "Admin User",
    timestamp: new Date().toISOString(),
    notes: "New shipment received from Apple",
    priceChange: { from: 999, to: 1099 },
  },
  {
    id: "today-2",
    productName: "Samsung Galaxy S24",
    action: "remove",
    quantity: 5,
    previousStock: 8,
    newStock: 3,
    user: "Staff User",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    notes: "Sold to customer - Order #12346",
  },
  {
    id: "today-3",
    productName: 'MacBook Pro 16"',
    action: "set",
    quantity: 15,
    previousStock: 12,
    newStock: 15,
    user: "Admin User",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    notes: "Inventory count adjustment",
    supplierChange: { from: "Apple Inc.", to: "Apple Authorized Reseller" },
  },
  {
    id: "today-4",
    productName: "Nike Air Max 270",
    action: "add",
    quantity: 30,
    previousStock: 45,
    newStock: 75,
    user: "Staff User",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    notes: "Restocking popular item",
  },
  {
    id: "today-5",
    productName: "Sony WH-1000XM5",
    action: "remove",
    quantity: 3,
    previousStock: 18,
    newStock: 15,
    user: "Admin User",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    notes: "Damaged items removed from inventory",
    priceChange: { from: 399, to: 379 },
  },
]

console.log("Sample logs for today:", sampleLogsForToday)
console.log("These logs can be used to test the PDF export functionality")
