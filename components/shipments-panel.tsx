"use client"

import { useState } from "react"
import { Plus, Search, Filter, Package, Truck, DollarSign, Calendar, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AddToShipmentDialog } from "@/components/add-to-shipment-dialog"

interface Product {
  id: string
  name: string
  category: string
  currentStock: number
  price: number
}

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

interface ShipmentsPanelProps {
  products: Product[]
  shipments: ShipmentItem[]
  categories: string[]
  onAddToShipment: (
    productId: string,
    productName: string,
    category: string,
    quantity: number,
    pricePerUnit: number,
    shippingFeePercentage: number,
    gstPercentage: number,
    notes?: string,
  ) => void
  onRemoveFromShipment: (shipmentId: string) => void
  onUpdateStock: (productId: string, newStock: number, action: string, notes?: string) => void
  userRole: "admin" | "staff"
}

export function ShipmentsPanel({
  products,
  shipments,
  categories,
  onAddToShipment,
  onRemoveFromShipment,
  onUpdateStock,
  userRole,
}: ShipmentsPanelProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [showAddDialog, setShowAddDialog] = useState(false)

  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch =
      shipment.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || shipment.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const totalShipmentValue = shipments.reduce((sum, s) => sum + s.totalValue, 0)
  const totalShipmentQuantity = shipments.reduce((sum, s) => sum + s.quantity, 0)
  const totalShippingFees = shipments.reduce((sum, s) => sum + s.shippingFee * s.quantity, 0)
  const totalGSTAmount = shipments.reduce((sum, s) => sum + s.gstAmount * s.quantity, 0)

  const handleAddToShipment = (
    productId: string,
    quantity: number,
    shippingFeePercentage: number,
    gstPercentage: number,
    notes?: string,
  ) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    if (quantity > product.currentStock) {
      alert(`Only ${product.currentStock} units are available in stock. Cannot mark ${quantity} units for shipment.`)
      return
    }

    // Add to shipment
    onAddToShipment(
      product.id,
      product.name,
      product.category,
      quantity,
      product.price,
      shippingFeePercentage,
      gstPercentage,
      notes,
    )

    // Update inventory stock
    const newStock = product.currentStock - quantity
    onUpdateStock(product.id, newStock, "remove", `Marked ${quantity} units for shipment`)

    setShowAddDialog(false)
  }

  const handleRemoveFromShipment = (shipmentId: string) => {
    const shipment = shipments.find((s) => s.id === shipmentId)
    if (!shipment) return

    // Return stock to inventory
    const product = products.find((p) => p.id === shipment.productId)
    if (product) {
      const newStock = product.currentStock + shipment.quantity
      onUpdateStock(product.id, newStock, "add", `Returned ${shipment.quantity} units from shipment to inventory`)
    }

    onRemoveFromShipment(shipmentId)
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">Total Shipments</CardTitle>
            <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{shipments.length}</div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">Products marked for shipment</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">Total Quantity</CardTitle>
            <Truck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{totalShipmentQuantity}</div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">Units ready to ship</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">Shipment Value</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">RS:{totalShipmentValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">Including shipping fees</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">Shipping Fees</CardTitle>
            <Calendar className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">RS:{totalShippingFees.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">Total shipping revenue</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">GST Amount</CardTitle>
            <Calendar className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">RS:{totalGSTAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">Total GST collected</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search shipments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
              <SelectItem value="all" className="dark:text-white dark:hover:bg-gray-700">
                All Categories
              </SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category} className="dark:text-white dark:hover:bg-gray-700">
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => setShowAddDialog(true)} className="dark:bg-blue-600 dark:hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Product to Shipment
        </Button>
      </div>

      {/* Shipments Table */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Shipment Items</CardTitle>
          <CardDescription className="dark:text-gray-400">
            Products marked for shipment with calculated shipping fees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="dark:border-gray-700">
                <TableHead className="dark:text-gray-300">Product Name</TableHead>
                <TableHead className="dark:text-gray-300">Category</TableHead>
                <TableHead className="dark:text-gray-300">Shipping Stock Count</TableHead>
                <TableHead className="dark:text-gray-300">Price (per unit)</TableHead>
                <TableHead className="dark:text-gray-300">Shipping Fee</TableHead>
                <TableHead className="dark:text-gray-300">GST</TableHead>
                <TableHead className="dark:text-gray-300">Total Value</TableHead>
                <TableHead className="dark:text-gray-300">Last Updated</TableHead>
                <TableHead className="dark:text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShipments.map((shipment) => (
                <TableRow key={shipment.id} className="dark:border-gray-700">
                  <TableCell className="font-medium dark:text-white">{shipment.productName}</TableCell>
                  <TableCell className="dark:text-gray-300">{shipment.category}</TableCell>
                  <TableCell className="dark:text-gray-300">
                    <Badge variant="secondary">{shipment.quantity} units</Badge>
                  </TableCell>
                  <TableCell className="dark:text-gray-300">RS:{shipment.pricePerUnit}</TableCell>
                  <TableCell className="dark:text-gray-300">
                    <div className="flex flex-col">
                      <span>RS:{shipment.shippingFee.toFixed(2)}</span>
                      <span className="text-xs text-gray-500">({shipment.shippingFeePercentage}%)</span>
                    </div>
                  </TableCell>
                  <TableCell className="dark:text-gray-300">
                    <div className="flex flex-col">
                      <span>RS:{shipment.gstAmount.toFixed(2)}</span>
                      <span className="text-xs text-gray-500">({shipment.gstPercentage}%)</span>
                    </div>
                  </TableCell>
                  <TableCell className="dark:text-gray-300">
                    <span className="font-medium">RS:{shipment.totalValue.toFixed(2)}</span>
                  </TableCell>
                  <TableCell className="dark:text-gray-300">
                    {new Date(shipment.lastUpdated).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveFromShipment(shipment.id)}
                      className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredShipments.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No shipments found</p>
              <p className="text-sm">Add products to shipment to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add to Shipment Dialog */}
      <AddToShipmentDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        products={products}
        onAddToShipment={handleAddToShipment}
      />
    </div>
  )
}
