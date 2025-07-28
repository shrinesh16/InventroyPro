"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download, Package, DollarSign, BarChart3, PieChart, Activity, FileText } from "lucide-react"
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

interface ReportsPanelProps {
  products: Product[]
  logs: Log[]
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

// Simple Line Chart Component - Updated to show only inventory
function SimpleLineChart({ data, title }: { data: any[]; title: string }) {
  const maxInventory = Math.max(...data.map((item) => item.inventory))

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h4>
      <div className="space-y-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Inventory Value</span>
          </div>
          <div
            className={`grid gap-2 ${data.length <= 7 ? "grid-cols-7" : data.length <= 12 ? "grid-cols-6" : "grid-cols-12"}`}
          >
            {data.map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{item.date}</div>
                <div
                  className="bg-blue-500 rounded-t mx-auto transition-all duration-500"
                  style={{
                    height: `${(item.inventory / maxInventory) * 80}px`,
                    width: "24px",
                  }}
                />
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  RS:{(item.inventory / 1000).toFixed(0)}k
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ReportsPanel({ products, logs }: ReportsPanelProps) {
  const [timeRange, setTimeRange] = useState("30d")
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
            { date: "Mon", inventory: 67000 },
            { date: "Tue", inventory: 65000 },
            { date: "Wed", inventory: 68000 },
            { date: "Thu", inventory: 66000 },
            { date: "Fri", inventory: 70000 },
            { date: "Sat", inventory: 69000 },
            { date: "Sun", inventory: 71000 },
          ]
        case "30d":
          return [
            { date: "Week 1", inventory: 45000 },
            { date: "Week 2", inventory: 52000 },
            { date: "Week 3", inventory: 48000 },
            { date: "Week 4", inventory: 61000 },
          ]
        case "90d":
          return [
            { date: "Jan", inventory: 45000 },
            { date: "Feb", inventory: 52000 },
            { date: "Mar", inventory: 48000 },
          ]
        case "1y":
          return [
            { date: "Q1", inventory: 45000 },
            { date: "Q2", inventory: 52000 },
            { date: "Q3", inventory: 48000 },
            { date: "Q4", inventory: 61000 },
          ]
        default:
          return [
            { date: "Jan", inventory: 45000 },
            { date: "Feb", inventory: 52000 },
            { date: "Mar", inventory: 48000 },
            { date: "Apr", inventory: 61000 },
            { date: "May", inventory: 55000 },
            { date: "Jun", inventory: 67000 },
          ]
      }
    }

    const generateMetricsMultiplier = (range: string) => {
      switch (range) {
        case "7d":
          return { growth: "+2.1%", period: "from last week" }
        case "30d":
          return { growth: "+8%", period: "from last month" }
        case "90d":
          return { growth: "+15%", period: "from last quarter" }
        case "1y":
          return { growth: "+24%", period: "from last year" }
        default:
          return { growth: "+8%", period: "from last month" }
      }
    }

    return {
      trendData: generateTrendData(timeRange),
      metrics: generateMetricsMultiplier(timeRange),
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

  // Prepare data for charts
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

  const exportReport = async () => {
    setIsExporting(true)
    setExportStatus("idle")

    try {
      const reportData = {
        products,
        logs,
        timeRange,
        categoryData,
        stockLevelData,
        trendData: timeRangeData.trendData,
        filteredLogs,
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
            Comprehensive inventory report generated successfully and downloaded!
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
          onClick={exportReport}
          disabled={isExporting}
          className="dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50"
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? "Generating Report..." : "Export Comprehensive Report"}
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">Total SKUs</CardTitle>
            <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{products.length}</div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              {timeRangeData.metrics.growth} {timeRangeData.metrics.period}
            </p>
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
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              {timeRangeData.metrics.growth} {timeRangeData.metrics.period}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Levels Chart */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 dark:text-white">
              <BarChart3 className="h-5 w-5" />
              <span>Top Products by Stock</span>
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
              Current inventory levels for highest stocked items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={stockLevelData} title="Stock Levels" />
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 dark:text-white">
              <PieChart className="h-5 w-5" />
              <span>Inventory by Category</span>
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
              Distribution of inventory value across categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimplePieChart data={categoryData} title="Category Distribution" />
          </CardContent>
        </Card>
      </div>

      {/* Trend Analysis */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 dark:text-white">
            <Activity className="h-5 w-5" />
            <span>Inventory Value Trends</span>
          </CardTitle>
          <CardDescription className="dark:text-gray-400">
            Historical inventory value trends for{" "}
            {timeRange === "7d"
              ? "the last 7 days"
              : timeRange === "30d"
                ? "the last 30 days"
                : timeRange === "90d"
                  ? "the last 90 days"
                  : "the last year"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SimpleLineChart
            data={timeRangeData.trendData}
            title={`Inventory Value Trends - ${timeRange === "7d" ? "Daily" : timeRange === "30d" ? "Weekly" : timeRange === "90d" ? "Monthly" : "Quarterly"} View`}
          />
        </CardContent>
      </Card>

      {/* Low Stock Report */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Low Stock Report</CardTitle>
          <CardDescription className="dark:text-gray-400">Products requiring immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {products.length > 0 ? (
              products
                .filter((product) => product.currentStock <= 10)
                .map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-750"
                  >
                    <div>
                      <h4 className="font-medium dark:text-white">{product.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-600 dark:text-red-400">{product.currentStock} units</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Critical Level</p>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No product data available</p>
                <p className="text-sm">Add some products to see reports</p>
              </div>
            )}

            {products.length > 0 && products.filter((product) => product.currentStock <= 10).length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No low stock items</p>
                <p className="text-sm">All products are above critical levels</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
