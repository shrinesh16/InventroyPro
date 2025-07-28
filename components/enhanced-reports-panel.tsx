"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Package, DollarSign, BarChart3, PieChart, Activity, FileText, Truck } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ReportsPDFService } from "@/lib/reports-pdf-service"

interface Product {
  id: string
  name: string
  category: string
  currentStock: number
  price: number
}

interface Log {
  id: string
  productName: string
  action: string
  quantity: number
  timestamp: string
}

interface ShipmentItem {
  id: string
  productName: string
  category: string
  quantity: number
  pricePerUnit: number
  shippingFee: number
  totalValue: number
  gstAmount: number
}

interface EnhancedReportsPanelProps {
  products: Product[]
  logs: Log[]
  shipments: ShipmentItem[]
}

// Simple Bar Chart Component
function SimpleBarChart({ data, title }: { data: any[]; title: string }) {
  const maxValue = Math.max(...data.map((item) => item.value))

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h4>
      <div className="space-y-3">
        {data.slice(0, 8).map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-20 text-xs text-gray-600 dark:text-gray-400 truncate">{item.name}</div>
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 relative">
              <div
                className="bg-blue-500 h-4 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
              <span className="absolute right-2 top-0 text-xs text-white font-medium leading-4">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Simple Pie Chart Component
function SimplePieChart({ data, title }: { data: any[]; title: string }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"]

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h4>
      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage = ((item.value / total) * 100).toFixed(1)
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  RS:{item.value.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{percentage}%</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function EnhancedReportsPanel({ products, logs, shipments }: EnhancedReportsPanelProps) {
  const [timeRange, setTimeRange] = useState("30d")
  const [activeTab, setActiveTab] = useState("inventory")
  const [isLoaded, setIsLoaded] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<"idle" | "success" | "error">("idle")

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Generate different data sets based on time range
  const timeRangeData = useMemo(() => {
    const generateTrendData = (range: string) => {
      switch (range) {
        case "7d":
          return [
            { date: "Mon", inventory: 67000, sales: 12000 },
            { date: "Tue", inventory: 65000, sales: 15000 },
            { date: "Wed", inventory: 68000, sales: 11000 },
            { date: "Thu", inventory: 66000, sales: 14000 },
            { date: "Fri", inventory: 70000, sales: 16000 },
            { date: "Sat", inventory: 69000, sales: 13000 },
            { date: "Sun", inventory: 71000, sales: 18000 },
          ]
        case "30d":
          return [
            { date: "Week 1", inventory: 45000, sales: 25000 },
            { date: "Week 2", inventory: 52000, sales: 28000 },
            { date: "Week 3", inventory: 48000, sales: 22000 },
            { date: "Week 4", inventory: 61000, sales: 35000 },
          ]
        case "90d":
          return [
            { date: "Jan", inventory: 45000, sales: 75000 },
            { date: "Feb", inventory: 52000, sales: 82000 },
            { date: "Mar", inventory: 48000, sales: 68000 },
          ]
        case "1y":
          return [
            { date: "Q1", inventory: 45000, sales: 225000 },
            { date: "Q2", inventory: 52000, sales: 246000 },
            { date: "Q3", inventory: 48000, sales: 204000 },
            { date: "Q4", inventory: 61000, sales: 305000 },
          ]
        default:
          return [
            { date: "Jan", inventory: 45000, sales: 75000 },
            { date: "Feb", inventory: 52000, sales: 82000 },
            { date: "Mar", inventory: 48000, sales: 68000 },
            { date: "Apr", inventory: 61000, sales: 91000 },
            { date: "May", inventory: 55000, sales: 77000 },
            { date: "Jun", inventory: 67000, sales: 89000 },
          ]
      }
    }

    return {
      trendData: generateTrendData(timeRange),
    }
  }, [timeRange])

  // Filter logs based on time range
  const filteredLogs = useMemo(() => {
    const now = new Date()
    const cutoffDate = new Date()

    switch (timeRange) {
      case "7d":
        cutoffDate.setDate(now.getDate() - 7)
        break
      case "30d":
        cutoffDate.setDate(now.getDate() - 30)
        break
      case "90d":
        cutoffDate.setDate(now.getDate() - 90)
        break
      case "1y":
        cutoffDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        cutoffDate.setDate(now.getDate() - 30)
    }

    return logs.filter((log) => new Date(log.timestamp) >= cutoffDate)
  }, [logs, timeRange])

  // Inventory data
  const inventoryData = useMemo(() => {
    const categoryData =
      products.length > 0
        ? Object.values(
            products.reduce(
              (acc, product) => {
                const category = product.category
                if (!acc[category]) {
                  acc[category] = { name: category, value: 0, stock: 0 }
                }
                acc[category].value += product.currentStock * product.price
                acc[category].stock += product.currentStock
                return acc
              },
              {} as Record<string, any>,
            ),
          )
        : [
            { name: "Electronics", value: 45000, stock: 120 },
            { name: "Footwear", value: 25000, stock: 80 },
            { name: "Clothing", value: 15000, stock: 60 },
            { name: "Home & Kitchen", value: 8000, stock: 40 },
          ]

    const stockLevelData =
      products.length > 0
        ? products
            .map((product) => ({
              name: product.name.length > 15 ? product.name.substring(0, 15) + "..." : product.name,
              value: product.currentStock,
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10)
        : [
            { name: "iPhone 15 Pro", value: 25 },
            { name: 'MacBook Pro 16"', value: 12 },
            { name: "Nike Air Max 270", value: 45 },
            { name: "Samsung Galaxy S24", value: 8 },
            { name: "Sony WH-1000XM5", value: 18 },
            { name: "Levi's 501 Jeans", value: 28 },
            { name: "Adidas Ultraboost", value: 3 },
            { name: "Instant Pot Duo", value: 6 },
          ]

    return { categoryData, stockLevelData }
  }, [products])

  // Shipment data
  const shipmentData = useMemo(() => {
    // Validate shipments array
    if (!shipments || !Array.isArray(shipments) || shipments.length === 0) {
      return {
        categoryData: [],
        topShipments: [],
        totalTurnover: 0,
        totalShippingFees: 0,
        totalGSTAmount: 0,
      }
    }

    const validShipments = shipments.filter(
      (s) => s && typeof s.totalValue === "number" && typeof s.quantity === "number" && s.category && s.productName,
    )

    const categoryData = Object.values(
      validShipments.reduce(
        (acc, shipment) => {
          const category = shipment.category
          if (!acc[category]) {
            acc[category] = { name: category, value: 0, quantity: 0 }
          }
          acc[category].value += shipment.totalValue || 0
          acc[category].quantity += shipment.quantity || 0
          return acc
        },
        {} as Record<string, any>,
      ),
    )

    const topShipments = validShipments
      .map((shipment) => ({
        name: shipment.productName.length > 15 ? shipment.productName.substring(0, 15) + "..." : shipment.productName,
        value: shipment.quantity || 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)

    const totalTurnover = validShipments.reduce((sum, shipment) => sum + (shipment.totalValue || 0), 0)
    const totalShippingFees = validShipments.reduce(
      (sum, shipment) => sum + (shipment.shippingFee || 0) * (shipment.quantity || 0),
      0,
    )
    const totalGSTAmount = validShipments.reduce(
      (sum, shipment) => sum + (shipment.gstAmount || 0) * (shipment.quantity || 0),
      0,
    )

    return { categoryData, topShipments, totalTurnover, totalShippingFees, totalGSTAmount }
  }, [shipments])

  const exportReport = async (reportType: "inventory" | "shipment") => {
    setIsExporting(true)
    setExportStatus("idle")

    try {
      // Validate data before export
      if (reportType === "shipment" && (!shipments || shipments.length === 0)) {
        throw new Error("No shipment data available for export")
      }

      if (reportType === "inventory" && (!products || products.length === 0)) {
        throw new Error("No inventory data available for export")
      }

      const reportData = {
        products: products || [],
        logs: logs || [],
        shipments: shipments || [],
        timeRange,
        categoryData: reportType === "inventory" ? inventoryData.categoryData : shipmentData.categoryData,
        stockLevelData: inventoryData.stockLevelData,
        trendData: timeRangeData.trendData,
        filteredLogs: filteredLogs || [],
        reportType,
      }

      await ReportsPDFService.generateReport(reportData)
      setExportStatus("success")
      setTimeout(() => setExportStatus("idle"), 3000)
    } catch (error) {
      console.error("Report export failed:", error)
      setExportStatus("error")
      setTimeout(() => setExportStatus("idle"), 3000)
    } finally {
      setIsExporting(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 dark:text-gray-400">Loading reports...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Export Status Alert */}
      {exportStatus === "success" && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
          <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Comprehensive report generated successfully and downloaded!
          </AlertDescription>
        </Alert>
      )}

      {exportStatus === "error" && (
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <FileText className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            Failed to generate report. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Report Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
              <SelectItem value="7d" className="dark:text-white dark:hover:bg-gray-700">
                Last 7 days
              </SelectItem>
              <SelectItem value="30d" className="dark:text-white dark:hover:bg-gray-700">
                Last 30 days
              </SelectItem>
              <SelectItem value="90d" className="dark:text-white dark:hover:bg-gray-700">
                Last 90 days
              </SelectItem>
              <SelectItem value="1y" className="dark:text-white dark:hover:bg-gray-700">
                Last year
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => exportReport(activeTab as "inventory" | "shipment")}
          disabled={isExporting}
          className="dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50"
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting
            ? "Generating Report..."
            : `Export ${activeTab === "inventory" ? "Inventory" : "Shipment"} Report`}
        </Button>
      </div>

      {/* Tabbed Reports */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 dark:bg-gray-800">
          <TabsTrigger value="inventory" className="dark:data-[state=active]:bg-gray-700">
            Inventory Reports
          </TabsTrigger>
          <TabsTrigger value="shipments" className="dark:data-[state=active]:bg-gray-700">
            Shipment Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-6">
          {/* Inventory Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium dark:text-white">Total SKUs</CardTitle>
                <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dark:text-white">{products.length}</div>
                <p className="text-xs text-muted-foreground dark:text-gray-400">Products in inventory</p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium dark:text-white">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dark:text-white">
                  RS:{products.reduce((sum, p) => sum + p.currentStock * p.price, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground dark:text-gray-400">Current inventory value</p>
              </CardContent>
            </Card>
          </div>

          {/* Inventory Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 dark:text-white">
                  <BarChart3 className="h-5 w-5" />
                  <span>Top Products by Stock</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleBarChart data={inventoryData.stockLevelData} title="Stock Levels" />
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 dark:text-white">
                  <PieChart className="h-5 w-5" />
                  <span>Inventory by Category</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SimplePieChart data={inventoryData.categoryData} title="Category Distribution" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="shipments" className="space-y-6">
          {/* Shipment Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium dark:text-white">Total Shipments</CardTitle>
                <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dark:text-white">{shipments.length}</div>
                <p className="text-xs text-muted-foreground dark:text-gray-400">Products marked for shipment</p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium dark:text-white">Shipment Turnover</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dark:text-white">
                  RS:{shipmentData.totalTurnover.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground dark:text-gray-400">Total shipment value</p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium dark:text-white">Shipping Revenue</CardTitle>
                <Activity className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dark:text-white">
                  RS:{shipmentData.totalShippingFees.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground dark:text-gray-400">From shipping fees</p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium dark:text-white">GST Collected</CardTitle>
                <FileText className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dark:text-white">
                  RS:{shipmentData.totalGSTAmount.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground dark:text-gray-400">Total GST amount</p>
              </CardContent>
            </Card>
          </div>

          {/* Shipment Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 dark:text-white">
                  <BarChart3 className="h-5 w-5" />
                  <span>Top Shipments by Quantity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleBarChart data={shipmentData.topShipments} title="Shipment Quantities" />
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 dark:text-white">
                  <PieChart className="h-5 w-5" />
                  <span>Shipments by Category</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SimplePieChart data={shipmentData.categoryData} title="Shipment Distribution" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
