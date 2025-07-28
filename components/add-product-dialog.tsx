"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface AddProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddProduct: (product: any) => void
  categories: string[]
}

export function AddProductDialog({ open, onOpenChange, onAddProduct, categories }: AddProductDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    currentStock: "",
    minThreshold: "",
    maxThreshold: "",
    price: "",
    supplier: "",
  })

  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [selectedCategoryType, setSelectedCategoryType] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAddProduct({
      ...formData,
      currentStock: Number.parseInt(formData.currentStock),
      minThreshold: Number.parseInt(formData.minThreshold),
      maxThreshold: Number.parseInt(formData.maxThreshold),
      price: Number.parseFloat(formData.price),
    })

    // Reset all form state
    setFormData({
      name: "",
      category: "",
      currentStock: "",
      minThreshold: "",
      maxThreshold: "",
      price: "",
      supplier: "",
    })
    setShowNewCategoryInput(false)
    setNewCategoryName("")
    setSelectedCategoryType("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Add New Product</DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            Add a new product to your inventory system.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right dark:text-white">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right dark:text-white">
                Category
              </Label>
              <Select
                value={selectedCategoryType}
                onValueChange={(value) => {
                  setSelectedCategoryType(value)
                  if (value === "new") {
                    setShowNewCategoryInput(true)
                    setFormData({ ...formData, category: "" })
                  } else {
                    setShowNewCategoryInput(false)
                    setNewCategoryName("")
                    setFormData({ ...formData, category: value })
                  }
                }}
              >
                <SelectTrigger className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="dark:text-white dark:hover:bg-gray-700">
                      {category}
                    </SelectItem>
                  ))}
                  <SelectItem value="new" className="dark:text-white dark:hover:bg-gray-700">
                    Add New Category
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {showNewCategoryInput && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newCategory" className="text-right dark:text-white">
                  New Category
                </Label>
                <Input
                  id="newCategory"
                  value={newCategoryName}
                  onChange={(e) => {
                    const value = e.target.value
                    setNewCategoryName(value)
                    setFormData({ ...formData, category: value })
                  }}
                  className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter category name"
                  required
                />
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currentStock" className="text-right dark:text-white">
                Stock
              </Label>
              <Input
                id="currentStock"
                type="number"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="minThreshold" className="text-right dark:text-white">
                Min Threshold
              </Label>
              <Input
                id="minThreshold"
                type="number"
                value={formData.minThreshold}
                onChange={(e) => setFormData({ ...formData, minThreshold: e.target.value })}
                className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="maxThreshold" className="text-right dark:text-white">
                Max Threshold
              </Label>
              <Input
                id="maxThreshold"
                type="number"
                value={formData.maxThreshold}
                onChange={(e) => setFormData({ ...formData, maxThreshold: e.target.value })}
                className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
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
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="supplier" className="text-right dark:text-white">
                Supplier
              </Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="dark:bg-blue-600 dark:hover:bg-blue-700">
              Add Product
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
