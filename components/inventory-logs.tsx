"use client"

import { useState } from "react"
import { Search, Filter, Download, User, Package, Calendar, AlertCircle, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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

interface InventoryLogsProps {
  logs: Log[]
}

export function InventoryLogs({ logs }: InventoryLogsProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [userFilter, setUserFilter] = useState("all")
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<"idle" | "success" | "error">("idle")

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesAction = actionFilter === "all" || log.action === actionFilter
    const matchesUser = userFilter === "all" || log.user === userFilter
    return matchesSearch && matchesAction && matchesUser
  })

  const actions = Array.from(new Set(logs.map((log) => log.action)))
  const users = Array.from(new Set(logs.map((log) => log.user)))

  // Get today's logs for export
  const todaysLogs = logs.filter((log) => {
    const today = new Date().toDateString()
    return new Date(log.timestamp).toDateString() === today
  })

  const getActionColor = (action: string) => {
    switch (action) {
      case "add":
        return "default"
      case "remove":
        return "destructive"
      case "set":
        return "secondary"
      case "transfer":
        return "outline"
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
      case "transfer":
        return "→"
      default:
        return "•"
    }
  }

  const exportTodaysLogsToPDF = async () => {
    if (todaysLogs.length === 0) {
      setExportStatus("error")
      setTimeout(() => setExportStatus("idle"), 3000)
      return
    }

    setIsExporting(true)
    setExportStatus("idle")

    try {
      await PDFService.generateDailyReport(todaysLogs)
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
            {todaysLogs.length === 0
              ? "No activities found for today. Cannot generate report."
              : "Failed to generate PDF report. Please try again."}
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">Total Activities</CardTitle>
            <Package className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{logs.length}</div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">All time activities</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">Today's Activities</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{todaysLogs.length}</div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">Activities today</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">Active Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{users.length}</div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">Users with activities</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">Stock Additions</CardTitle>
            <Package className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{logs.filter((log) => log.action === "add").length}</div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">Stock additions</p>
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
              {actions.map((action) => (
                <SelectItem key={action} value={action} className="dark:text-white dark:hover:bg-gray-700">
                  {action.charAt(0).toUpperCase() + action.slice(1)}
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
              {users.map((user) => (
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
          {isExporting ? "Generating PDF..." : `Export Today's Report (${todaysLogs.length})`}
        </Button>
      </div>

      {/* Activity Logs Table */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Activity Logs</CardTitle>
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
              {filteredLogs.map((log) => (
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

          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No activity logs found</p>
              <p className="text-sm">Try adjusting your search filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
