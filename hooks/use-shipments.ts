"use client"

import { useState } from "react"

interface ShipmentItem {
  id: string
  productId: string
  productName: string
  category: string
  quantity: number
  pricePerUnit: number
  shippingFeePercentage: number
  shippingFee: number
  gstPercentage: number
  gstAmount: number
  totalValue: number
  lastUpdated: string
}

interface ShipmentLog {
  id: string
  productName: string
  action: "marked_for_shipment" | "stock_reduced" | "shipment_created"
  quantity: number
  stockChange: number
  user: string
  timestamp: string
  notes?: string
  shippingFee?: number
  gstAmount?: number
}

export function useShipments() {
  const [shipments, setShipments] = useState<ShipmentItem[]>([])
  const [shipmentLogs, setShipmentLogs] = useState<ShipmentLog[]>([])

  const addToShipment = (
    productId: string,
    productName: string,
    category: string,
    quantity: number,
    pricePerUnit: number,
    shippingFeePercentage: number,
    gstPercentage: number,
    notes?: string,
  ) => {
    const shippingFee = (pricePerUnit * shippingFeePercentage) / 100
    const gstAmount = (pricePerUnit * gstPercentage) / 100
    const totalValue = (pricePerUnit + shippingFee + gstAmount) * quantity

    const newShipmentItem: ShipmentItem = {
      id: Date.now().toString() + Math.random(),
      productId,
      productName,
      category,
      quantity,
      pricePerUnit,
      shippingFeePercentage,
      shippingFee,
      gstPercentage,
      gstAmount,
      totalValue,
      lastUpdated: new Date().toISOString(),
    }

    setShipments((prev) => [...prev, newShipmentItem])

    // Add shipment log
    const newLog: ShipmentLog = {
      id: Date.now().toString() + Math.random(),
      productName,
      action: "marked_for_shipment",
      quantity,
      stockChange: -quantity,
      user: "Current User",
      timestamp: new Date().toISOString(),
      notes: notes || `Marked ${quantity} units for shipment`,
      shippingFee,
      gstAmount,
    }

    setShipmentLogs((prev) => [newLog, ...prev])
  }

  const removeFromShipment = (shipmentId: string) => {
    setShipments((prev) => prev.filter((item) => item.id !== shipmentId))
  }

  const getShipmentsByCategory = () => {
    const categoryData: Record<string, { name: string; value: number; quantity: number }> = {}

    shipments.forEach((shipment) => {
      if (!categoryData[shipment.category]) {
        categoryData[shipment.category] = {
          name: shipment.category,
          value: 0,
          quantity: 0,
        }
      }
      categoryData[shipment.category].value += shipment.totalValue
      categoryData[shipment.category].quantity += shipment.quantity
    })

    return Object.values(categoryData)
  }

  const getTotalShipmentValue = () => {
    return shipments.reduce((sum, shipment) => sum + shipment.totalValue, 0)
  }

  const getTotalShipmentQuantity = () => {
    return shipments.reduce((sum, shipment) => sum + shipment.quantity, 0)
  }

  const getTotalGSTAmount = () => {
    return shipments.reduce((sum, shipment) => sum + shipment.gstAmount * shipment.quantity, 0)
  }

  return {
    shipments,
    shipmentLogs,
    addToShipment,
    removeFromShipment,
    getShipmentsByCategory,
    getTotalShipmentValue,
    getTotalShipmentQuantity,
    getTotalGSTAmount,
  }
}
