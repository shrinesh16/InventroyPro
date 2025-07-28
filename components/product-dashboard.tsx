"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, Package, AlertTriangle, TrendingUp, ArrowDownWideNarrowIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AddProductDialog } from "@/components/add-product-dialog"
import { UpdateStockDialog } from "@/components/update-stock-dialog"

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

interface ProductDashboardProps {
  products: Product[]
  categories: string[]
  onUpdateStock: (
    productId: string,
    newStock: number,
    action: string,
    notes?: string,
    price?: number,
    supplier?: string,
  ) => void
  onAddProduct: (product: Omit<Product, "id" | "lastUpdated">) => void
  userRole: "admin" | "staff"
  productToUpdate?: Product | null
  onProductUpdateHandled?: () => void
}

export function ProductDashboard({
  products,
  categories,
  onUpdateStock,
  onAddProduct,
  userRole,
  productToUpdate,
  onProductUpdateHandled,
}: ProductDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  useEffect(() => {
    if (productToUpdate) {
      setSelectedProduct(productToUpdate)
      if (onProductUpdateHandled) {
        onProductUpdateHandled()
      }
    }
  }, [productToUpdate, onProductUpdateHandled])

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const lowStockProducts = products.filter((p) => p.currentStock <= p.minThreshold)
  const totalValue = products.reduce((sum, p) => sum + p.currentStock * p.price, 0)

  const getStockStatus = (product: Product) => {
    if (product.currentStock <= product.minThreshold) return "low"
    if (product.currentStock >= product.maxThreshold) return "high"
    return "normal"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "low":
        return "destructive"
      case "high":
        return "secondary"
      default:
        return "default"
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">Total Products</CardTitle>
            <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{products.length}</div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">Across {categories.length} categories</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">Total Inventory Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">RS:{totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">Current market value</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">Categories</CardTitle>
            <ArrowDownWideNarrowIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{categories.length}</div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">Product categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
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

        {userRole === "admin" && (
          <Button onClick={() => setShowAddDialog(true)} className="dark:bg-blue-600 dark:hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        )}
      </div>

      {/* Products Table */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Product Inventory</CardTitle>
          <CardDescription className="dark:text-gray-400">
            Manage your product stock levels and monitor inventory status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="dark:border-gray-700">
                <TableHead className="dark:text-gray-300">Product</TableHead>
                <TableHead className="dark:text-gray-300">Category</TableHead>
                <TableHead className="dark:text-gray-300">Current Stock</TableHead>
                <TableHead className="dark:text-gray-300">Status</TableHead>
                <TableHead className="dark:text-gray-300">Price</TableHead>
                <TableHead className="dark:text-gray-300">Supplier</TableHead>
                <TableHead className="dark:text-gray-300">Last Updated</TableHead>
                <TableHead className="dark:text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const status = getStockStatus(product)
                return (
                  <TableRow key={product.id} className="dark:border-gray-700">
                    <TableCell className="font-medium dark:text-white">{product.name}</TableCell>
                    <TableCell className="dark:text-gray-300">{product.category}</TableCell>
                    <TableCell className="dark:text-gray-300">
                      <div className="flex items-center space-x-2">
                        <span>{product.currentStock}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">(Min: {product.minThreshold})</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(status)}>
                        {status === "low" ? "Low Stock" : status === "high" ? "Overstock" : "Normal"}
                      </Badge>
                    </TableCell>
                    <TableCell className="dark:text-gray-300">RS:{product.price}</TableCell>
                    <TableCell className="dark:text-gray-300">{product.supplier}</TableCell>
                    <TableCell className="dark:text-gray-300">
                      {new Date(product.lastUpdated).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedProduct(product)}
                        className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                      >
                        Update Stock
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddProductDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAddProduct={onAddProduct}
        categories={categories}
      />

      <UpdateStockDialog
        open={!!selectedProduct}
        onOpenChange={() => setSelectedProduct(null)}
        product={selectedProduct}
        onUpdateStock={onUpdateStock}
      />
    </div>
  )
}
