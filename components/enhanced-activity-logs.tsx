"use client"

import { useState } from "react"
import { Search, Filter, Download, User, Package, Calendar, AlertCircle, CheckCircle, Truck } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PDFService } from "@/lib/pdf-service"

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

interface EnhancedActivityLogsProps {
  logs: Log[]
  shipmentLogs: ShipmentLog[]
}

export function EnhancedActivityLogs({ logs, shipmentLogs }: EnhancedActivityLogsProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [userFilter, setUserFilter] = useState("all")
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<"idle" | "success" | "error">("idle")

  // Filter inventory logs
  const filteredInventoryLogs = logs.filter((log) => {
    const matchesSearch =
      log.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesAction = actionFilter === "all" || log.action === actionFilter
    const matchesUser = userFilter === "all" || log.user === userFilter
    return matchesSearch && matchesAction && matchesUser
  })

  // Filter shipment logs
  const filteredShipmentLogs = shipmentLogs.filter((log) => {
    const matchesSearch =
      log.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesAction = actionFilter === "all" || log.action === actionFilter
    const matchesUser = userFilter === "all" || log.user === userFilter
    return matchesSearch && matchesAction && matchesUser
  })

  const inventoryActions = Array.from(new Set(logs.map((log) => log.action)))
  const shipmentActions = Array.from(new Set(shipmentLogs.map((log) => log.action)))
  const allUsers = Array.from(new Set([...logs.map((log) => log.user), ...shipmentLogs.map((log) => log.user)]))

  const getActionColor = (action: string) => {
    switch (action) {
      case "add":
        return "default"
      case "remove":
        return "destructive"
      case "marked_for_shipment":
        return "secondary"
      case "stock_reduced":
        return "destructive"
      case "shipment_created":
        return "default"
      default:
        return "default"
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "add":
        return "+"
      case "remove":
        return "-"
      case "marked_for_shipment":
        return "📦"
      case "stock_reduced":
        return "↓"
      case "shipment_created":
        return "🚚"
      default:
        return "•"
    }
  }

  const exportTodaysLogsToPDF = async () => {
    const todaysInventoryLogs = logs.filter((log) => {
      const today = new Date().toDateString()
      return new Date(log.timestamp).toDateString() === today
    })

    const todaysShipmentLogs = shipmentLogs.filter((log) => {
      const today = new Date().toDateString()
      return new Date(log.timestamp).toDateString() === today
    })

    if (todaysInventoryLogs.length === 0 && todaysShipmentLogs.length === 0) {
      setExportStatus("error")
      setTimeout(() => setExportStatus("idle"), 3000)
      return
    }

    setIsExporting(true)
    setExportStatus("idle")

    try {
      // Combine both log types for export
      const combinedLogs = [
        ...todaysInventoryLogs.map((log) => ({
          ...log,
          type: "inventory",
        })),
        ...todaysShipmentLogs.map((log) => ({
          ...log,
          type: "shipment",
          previousStock: 0,
          newStock: 0,
        })),
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      await PDFService.generateDailyReport(combinedLogs)
      setExportStatus("success")
      setTimeout(() => setExportStatus("idle"), 3000)
    } catch (error) {
      console.error("PDF export failed:", error)
      setExportStatus("error")
      setTimeout(() => setExportStatus("idle"), 3000)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Export Status Alert */}
      {exportStatus === "success" && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            PDF report generated successfully and downloaded!
          </AlertDescription>
        </Alert>
      )}

      {exportStatus === "error" && (
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            No activities found for today or failed to generate PDF report.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">Inventory Activities</CardTitle>
            <Package className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{logs.length}</div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">Total inventory activities</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">Shipment Activities</CardTitle>
            <Truck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{shipmentLogs.length}</div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">Total shipment activities</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">Active Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{allUsers.length}</div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">Users with activities</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">Today's Activities</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">
              {
                [...logs, ...shipmentLogs].filter((log) => {
                  const today = new Date().toDateString()
                  return new Date(log.timestamp).toDateString() === today
                }).length
              }
            </div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">Activities today</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-48 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
              <SelectItem value="all" className="dark:text-white dark:hover:bg-gray-700">
                All Actions
              </SelectItem>
              {[...inventoryActions, ...shipmentActions].map((action) => (
                <SelectItem key={action} value={action} className="dark:text-white dark:hover:bg-gray-700">
                  {action.charAt(0).toUpperCase() + action.slice(1).replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-48 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <User className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by user" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
              <SelectItem value="all" className="dark:text-white dark:hover:bg-gray-700">
                All Users
              </SelectItem>
              {allUsers.map((user) => (
                <SelectItem key={user} value={user} className="dark:text-white dark:hover:bg-gray-700">
                  {user}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={exportTodaysLogsToPDF}
          disabled={isExporting}
          className="dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50"
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? "Generating PDF..." : "Export Today's Report"}
        </Button>
      </div>

      {/* Tabbed Activity Logs */}
      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="grid w-full grid-cols-2 dark:bg-gray-800">
          <TabsTrigger value="inventory" className="dark:data-[state=active]:bg-gray-700">
            Inventory Activity Logs
          </TabsTrigger>
          <TabsTrigger value="shipments" className="dark:data-[state=active]:bg-gray-700">
            Shipment Activity Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Inventory Activity Logs</CardTitle>
              <CardDescription className="dark:text-gray-400">
                Complete history of all inventory movements and changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="dark:border-gray-700">
                    <TableHead className="dark:text-gray-300">Timestamp</TableHead>
                    <TableHead className="dark:text-gray-300">Product</TableHead>
                    <TableHead className="dark:text-gray-300">Action</TableHead>
                    <TableHead className="dark:text-gray-300">Quantity</TableHead>
                    <TableHead className="dark:text-gray-300">Stock Change</TableHead>
                    <TableHead className="dark:text-gray-300">User</TableHead>
                    <TableHead className="dark:text-gray-300">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventoryLogs.map((log) => (
                    <TableRow key={log.id} className="dark:border-gray-700">
                      <TableCell className="font-mono text-sm dark:text-gray-300">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium dark:text-white">{log.productName}</TableCell>
                      <TableCell>
                        <Badge variant={getActionColor(log.action)}>
                          {getActionIcon(log.action)} {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="dark:text-gray-300">{log.quantity}</TableCell>
                      <TableCell className="dark:text-gray-300">
                        <span className="font-mono">
                          {log.previousStock} → {log.newStock}
                        </span>
                      </TableCell>
                      <TableCell className="dark:text-gray-300">{log.user}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="space-y-1">
                          {log.notes && <div className="truncate dark:text-gray-300">{log.notes}</div>}
                          {log.priceChange && (
                            <div className="text-xs text-blue-600 dark:text-blue-400">
                              Price: RS:{log.priceChange.from} → RS:{log.priceChange.to}
                            </div>
                          )}
                          {log.supplierChange && (
                            <div className="text-xs text-green-600 dark:text-green-400">
                              Supplier: {log.supplierChange.from} → {log.supplierChange.to}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredInventoryLogs.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No inventory activity logs found</p>
                  <p className="text-sm">Try adjusting your search filters</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipments">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Shipment Activity Logs</CardTitle>
              <CardDescription className="dark:text-gray-400">
                Complete history of all shipment activities and stock movements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="dark:border-gray-700">
                    <TableHead className="dark:text-gray-300">Timestamp</TableHead>
                    <TableHead className="dark:text-gray-300">Product</TableHead>
                    <TableHead className="dark:text-gray-300">Action</TableHead>
                    <TableHead className="dark:text-gray-300">Quantity</TableHead>
                    <TableHead className="dark:text-gray-300">Stock Change</TableHead>
                    <TableHead className="dark:text-gray-300">User</TableHead>
                    <TableHead className="dark:text-gray-300">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShipmentLogs.map((log) => (
                    <TableRow key={log.id} className="dark:border-gray-700">
                      <TableCell className="font-mono text-sm dark:text-gray-300">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium dark:text-white">{log.productName}</TableCell>
                      <TableCell>
                        <Badge variant={getActionColor(log.action)}>
                          {getActionIcon(log.action)} {log.action.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="dark:text-gray-300">{log.quantity}</TableCell>
                      <TableCell className="dark:text-gray-300">
                        <span className="font-mono text-red-500">{log.stockChange}</span>
                      </TableCell>
                      <TableCell className="dark:text-gray-300">{log.user}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="space-y-1">
                          {log.notes && <div className="truncate dark:text-gray-300">{log.notes}</div>}
                          {log.shippingFee && (
                            <div className="text-xs text-purple-600 dark:text-purple-400">
                              Shipping Fee: RS:{log.shippingFee.toFixed(2)}
                            </div>
                          )}
                          {log.gstAmount && (
                            <div className="text-xs text-red-600 dark:text-red-400">
                              GST: RS:{log.gstAmount.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredShipmentLogs.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No shipment activity logs found</p>
                  <p className="text-sm">Try adjusting your search filters</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
