"use client"

import { useState, useEffect } from "react"

interface Product {
  id: string
  name: string
  category: string
  currentStock: number
  minThreshold: number
  maxThreshold: number
  price: number
  supplier: string
  lastUpdated: string
}

interface Alert {
  id: string
  type: "low_stock" | "out_of_stock" | "reorder" | "expiry"
  productName: string
  message: string
  severity: "high" | "medium" | "low"
  timestamp: string
  acknowledged: boolean
}

interface Log {
  id: string
  productName: string
  action: string
  quantity: number
  previousStock: number
  newStock: number
  user: string
  timestamp: string
  notes?: string
  priceChange?: { from: number; to: number }
  supplierChange?: { from: string; to: string }
}

const initialProducts: Product[] = [
  {
    id: "1",
    name: "iPhone 15 Pro",
    category: "Electronics",
    currentStock: 25,
    minThreshold: 10,
    maxThreshold: 100,
    price: 999,
    supplier: "Apple Inc.",
    lastUpdated: "2024-01-15",
  },
  {
    id: "2",
    name: "Samsung Galaxy S24",
    category: "Electronics",
    currentStock: 8,
    minThreshold: 15,
    maxThreshold: 80,
    price: 899,
    supplier: "Samsung",
    lastUpdated: "2024-01-14",
  },
  {
    id: "3",
    name: 'MacBook Pro 16"',
    category: "Electronics",
    currentStock: 12,
    minThreshold: 5,
    maxThreshold: 30,
    price: 2499,
    supplier: "Apple Inc.",
    lastUpdated: "2024-01-13",
  },
  {
    id: "4",
    name: "Nike Air Max 270",
    category: "Footwear",
    currentStock: 45,
    minThreshold: 20,
    maxThreshold: 100,
    price: 150,
    supplier: "Nike",
    lastUpdated: "2024-01-12",
  },
  {
    id: "5",
    name: "Adidas Ultraboost 22",
    category: "Footwear",
    currentStock: 3,
    minThreshold: 15,
    maxThreshold: 75,
    price: 180,
    supplier: "Adidas",
    lastUpdated: "2024-01-11",
  },
  {
    id: "6",
    name: "Levi's 501 Jeans",
    category: "Clothing",
    currentStock: 28,
    minThreshold: 10,
    maxThreshold: 60,
    price: 89,
    supplier: "Levi Strauss & Co.",
    lastUpdated: "2024-01-10",
  },
  {
    id: "7",
    name: "Sony WH-1000XM5",
    category: "Electronics",
    currentStock: 18,
    minThreshold: 8,
    maxThreshold: 40,
    price: 399,
    supplier: "Sony",
    lastUpdated: "2024-01-09",
  },
  {
    id: "8",
    name: "Instant Pot Duo 7-in-1",
    category: "Home & Kitchen",
    currentStock: 6,
    minThreshold: 12,
    maxThreshold: 50,
    price: 99,
    supplier: "Instant Brands",
    lastUpdated: "2024-01-08",
  },
]

const initialAlerts: Alert[] = [
  {
    id: "1",
    type: "low_stock",
    productName: "Samsung Galaxy S24",
    message: "Stock level is below minimum threshold (8/15 units)",
    severity: "high",
    timestamp: "2024-01-15T10:30:00Z",
    acknowledged: false,
  },
  {
    id: "2",
    type: "low_stock",
    productName: "Adidas Ultraboost 22",
    message: "Critical stock level - only 3 units remaining",
    severity: "high",
    timestamp: "2024-01-15T09:15:00Z",
    acknowledged: false,
  },
  {
    id: "3",
    type: "reorder",
    productName: "Instant Pot Duo 7-in-1",
    message: "Reorder recommended - stock below threshold",
    severity: "medium",
    timestamp: "2024-01-15T08:45:00Z",
    acknowledged: false,
  },
]

// Add some sample logs for today to test PDF export
const todaysSampleLogs: Log[] = [
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
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    notes: "Sold to customer - Order #12346",
  },
  {
    id: "today-3",
    productName: 'MacBook Pro 16"',
    action: "add",
    quantity: 3,
    previousStock: 12,
    newStock: 15,
    user: "Admin User",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
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
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
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
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    notes: "Damaged items removed from inventory",
    priceChange: { from: 399, to: 379 },
  },
]

const initialLogs: Log[] = [
  {
    id: "1",
    productName: "iPhone 15 Pro",
    action: "add",
    quantity: 50,
    previousStock: 75,
    newStock: 125,
    user: "Admin User",
    timestamp: "2024-01-15T14:30:00Z",
    notes: "New shipment received from supplier",
  },
  {
    id: "2",
    productName: "Samsung Galaxy S24",
    action: "remove",
    quantity: 7,
    previousStock: 15,
    newStock: 8,
    user: "Staff User",
    timestamp: "2024-01-15T12:15:00Z",
    notes: "Sold to customer - Order #12345",
  },
  {
    id: "3",
    productName: 'MacBook Pro 16"',
    action: "add",
    quantity: 4,
    previousStock: 8,
    newStock: 12,
    user: "Admin User",
    timestamp: "2024-01-15T11:00:00Z",
    notes: "Stock adjustment after inventory count",
  },
  ...todaysSampleLogs, // Add today's sample logs
]

export function useInventory() {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts)
  const [logs, setLogs] = useState<Log[]>(initialLogs)
  const [categories, setCategories] = useState<string[]>(["Electronics", "Footwear", "Clothing", "Home & Kitchen"])

  const addCategory = (categoryName: string) => {
    if (categoryName && !categories.includes(categoryName)) {
      setCategories((prev) => [...prev, categoryName])
    }
  }

  // Generate alerts based on stock levels
  useEffect(() => {
    const newAlerts: Alert[] = []

    products.forEach((product) => {
      if (product.currentStock <= product.minThreshold) {
        const existingAlert = alerts.find((alert) => alert.productName === product.name && alert.type === "low_stock")

        if (!existingAlert) {
          newAlerts.push({
            id: Date.now().toString() + Math.random(),
            type: product.currentStock === 0 ? "out_of_stock" : "low_stock",
            productName: product.name,
            message:
              product.currentStock === 0
                ? "Product is out of stock"
                : `Stock level is below minimum threshold (${product.currentStock}/${product.minThreshold} units)`,
            severity:
              product.currentStock === 0
                ? "high"
                : product.currentStock <= product.minThreshold / 2
                  ? "high"
                  : "medium",
            timestamp: new Date().toISOString(),
            acknowledged: false,
          })
        }
      }
    })

    if (newAlerts.length > 0) {
      setAlerts((prev) => [...prev, ...newAlerts])
    }
  }, [products])

  const updateStock = (
    productId: string,
    newStock: number,
    action: string,
    notes?: string,
    newPrice?: number,
    newSupplier?: string,
  ) => {
    setProducts((prev) =>
      prev.map((product) => {
        if (product.id === productId) {
          const priceChanged = newPrice !== undefined && newPrice !== product.price
          const supplierChanged = newSupplier !== undefined && newSupplier !== product.supplier

          const updatedProduct = {
            ...product,
            currentStock: newStock,
            price: newPrice !== undefined ? newPrice : product.price,
            supplier: newSupplier !== undefined ? newSupplier : product.supplier,
            lastUpdated: new Date().toISOString().split("T")[0],
          }

          // Create comprehensive notes
          let logNotes = notes || ""
          if (priceChanged) {
            logNotes += `${logNotes ? " | " : ""}Price updated: RS:${product.price} → RS:${newPrice}`
          }
          if (supplierChanged) {
            logNotes += `${logNotes ? " | " : ""}Supplier updated: ${product.supplier} → ${newSupplier}`
          }

          // Add log entry
          const newLog: Log = {
            id: Date.now().toString() + Math.random(),
            productName: product.name,
            action,
            quantity: Math.abs(newStock - product.currentStock),
            previousStock: product.currentStock,
            newStock,
            user: "Current User", // In a real app, this would be the actual user
            timestamp: new Date().toISOString(),
            notes: logNotes,
            ...(priceChanged && {
              priceChange: { from: product.price, to: newPrice! },
            }),
            ...(supplierChanged && {
              supplierChange: { from: product.supplier, to: newSupplier! },
            }),
          }

          setLogs((prev) => [newLog, ...prev])

          return updatedProduct
        }
        return product
      }),
    )
  }

  const addProduct = (productData: Omit<Product, "id" | "lastUpdated">) => {
    // Add category if it's new
    if (productData.category && !categories.includes(productData.category)) {
      addCategory(productData.category)
    }

    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      lastUpdated: new Date().toISOString().split("T")[0],
    }

    setProducts((prev) => [...prev, newProduct])

    // Add log entry
    const newLog: Log = {
      id: Date.now().toString() + Math.random(),
      productName: newProduct.name,
      action: "add",
      quantity: newProduct.currentStock,
      previousStock: 0,
      newStock: newProduct.currentStock,
      user: "Current User",
      timestamp: new Date().toISOString(),
      notes: "New product added to inventory",
    }

    setLogs((prev) => [newLog, ...prev])
  }

  return {
    products,
    alerts,
    logs,
    categories,
    updateStock,
    addProduct,
    addCategory,
  }
}
