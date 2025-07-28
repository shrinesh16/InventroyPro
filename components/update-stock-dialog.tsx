"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
  currentStock: number
  price: number
  supplier: string
}

interface UpdateStockDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  onUpdateStock: (
    productId: string,
    newStock: number,
    action: string,
    notes?: string,
    price?: number,
    supplier?: string,
  ) => void
}

export function UpdateStockDialog({ open, onOpenChange, product, onUpdateStock }: UpdateStockDialogProps) {
  const [action, setAction] = useState("add")
  const [quantity, setQuantity] = useState("")
  const [notes, setNotes] = useState("")
  const [price, setPrice] = useState("")
  const [supplier, setSupplier] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form with product data when dialog opens
  useEffect(() => {
    if (product && open) {
      setPrice(product.price.toString())
      setSupplier(product.supplier)
    }
  }, [product, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return

    setIsSubmitting(true)

    try {
      const qty = Number.parseInt(quantity)
      const newStock =
        action === "add"
          ? product.currentStock + qty
          : action === "remove"
            ? Math.max(0, product.currentStock - qty)
            : qty

      const updatedPrice = price ? Number.parseFloat(price) : product.price
      const updatedSupplier = supplier || product.supplier

      onUpdateStock(product.id, newStock, action, notes, updatedPrice, updatedSupplier)

      // Reset form
      setQuantity("")
      setNotes("")
      setPrice("")
      setSupplier("")
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating stock:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Update Stock - {product.name}</DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            Current stock: {product.currentStock} units | Price: RS:{product.price} | Supplier: {product.supplier}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="action" className="text-right dark:text-white">
                Action
              </Label>
              <Select value={action} onValueChange={setAction}>
                <SelectTrigger className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  <SelectItem value="add" className="dark:text-white dark:hover:bg-gray-700">
                    Add Stock
                  </SelectItem>
                  <SelectItem value="remove" className="dark:text-white dark:hover:bg-gray-700">
                    Remove Stock
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right dark:text-white">
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right dark:text-white">
                Price (RS:)
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder={`Current: RS:${product.price}`}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="supplier" className="text-right dark:text-white">
                Supplier
              </Label>
              <Input
                id="supplier"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder={`Current: ${product.supplier}`}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right dark:text-white">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Optional notes about this update..."
                disabled={isSubmitting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="dark:bg-blue-600 dark:hover:bg-blue-700" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
