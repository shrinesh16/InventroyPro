"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Product {
  id: string
  name: string
  category: string
  currentStock: number
  price: number
}

interface AddToShipmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  products: Product[]
  onAddToShipment: (
    productId: string,
    quantity: number,
    shippingFeePercentage: number,
    gstPercentage: number,
    notes?: string,
  ) => void
}

export function AddToShipmentDialog({ open, onOpenChange, products, onAddToShipment }: AddToShipmentDialogProps) {
  const [selectedProductId, setSelectedProductId] = useState("")
  const [quantity, setQuantity] = useState("")
  const [shippingFeePercentage, setShippingFeePercentage] = useState("")
  const [gstPercentage, setGstPercentage] = useState("")
  const [notes, setNotes] = useState("")

  const selectedProduct = products.find((p) => p.id === selectedProductId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProductId || !quantity || !shippingFeePercentage || !gstPercentage) return

    const qty = Number.parseInt(quantity)
    const feePercentage = Number.parseFloat(shippingFeePercentage)
    const gstPercent = Number.parseFloat(gstPercentage)

    onAddToShipment(selectedProductId, qty, feePercentage, gstPercent, notes)

    // Reset form
    setSelectedProductId("")
    setQuantity("")
    setShippingFeePercentage("")
    setGstPercentage("")
    setNotes("")
  }

  const calculateShippingFee = () => {
    if (!selectedProduct || !shippingFeePercentage) return 0
    return (selectedProduct.price * Number.parseFloat(shippingFeePercentage)) / 100
  }

  const calculateGSTAmount = () => {
    if (!selectedProduct || !gstPercentage) return 0
    return (selectedProduct.price * Number.parseFloat(gstPercentage)) / 100
  }

  const calculateTotalValue = () => {
    if (!selectedProduct || !quantity || !shippingFeePercentage || !gstPercentage) return 0
    const qty = Number.parseInt(quantity)
    const shippingFee = calculateShippingFee()
    const gstAmount = calculateGSTAmount()
    return (selectedProduct.price + shippingFee + gstAmount) * qty
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Add Product to Shipment</DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            Select a product from inventory and specify shipment details
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="product" className="text-right dark:text-white">
                Product
              </Label>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  {products
                    .filter((product) => product.currentStock > 0)
                    .map((product) => (
                      <SelectItem
                        key={product.id}
                        value={product.id}
                        className="dark:text-white dark:hover:bg-gray-700"
                      >
                        {product.name} (Stock: {product.currentStock})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProduct && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right dark:text-white">Details</Label>
                <div className="col-span-3 text-sm dark:text-gray-300">
                  <p>Category: {selectedProduct.category}</p>
                  <p>Available Stock: {selectedProduct.currentStock} units</p>
                  <p>Price per Unit: RS:{selectedProduct.price}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right dark:text-white">
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={selectedProduct?.currentStock || 1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter quantity"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="shippingFee" className="text-right dark:text-white">
                Shipping Fee %
              </Label>
              <Input
                id="shippingFee"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={shippingFeePercentage}
                onChange={(e) => setShippingFeePercentage(e.target.value)}
                className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter shipping fee percentage"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gstPercentage" className="text-right dark:text-white">
                GST %
              </Label>
              <Input
                id="gstPercentage"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={gstPercentage}
                onChange={(e) => setGstPercentage(e.target.value)}
                className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter GST percentage"
                required
              />
            </div>

            {selectedProduct && quantity && shippingFeePercentage && gstPercentage && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right dark:text-white">Calculation</Label>
                <div className="col-span-3 text-sm dark:text-gray-300 space-y-1">
                  <p>Base Price per Unit: RS:{selectedProduct.price.toFixed(2)}</p>
                  <p>
                    Shipping Fee per Unit: RS:{calculateShippingFee().toFixed(2)} ({shippingFeePercentage}%)
                  </p>
                  <p>
                    GST per Unit: RS:{calculateGSTAmount().toFixed(2)} ({gstPercentage}%)
                  </p>
                  <p>
                    Total per Unit: RS:
                    {(selectedProduct.price + calculateShippingFee() + calculateGSTAmount()).toFixed(2)}
                  </p>
                  <p className="font-medium text-green-600 dark:text-green-400">
                    Total Shipment Value: RS:{calculateTotalValue().toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right dark:text-white">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Optional notes about this shipment..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="dark:bg-blue-600 dark:hover:bg-blue-700">
              Add to Shipment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
