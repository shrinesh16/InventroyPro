"use client"

import { useState } from "react"
import { AlertTriangle, Bell, Mail, MessageSquare, X, Check, Settings } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useNotificationSettings } from "@/hooks/use-notification-settings"
import { useNotificationSystem } from "@/hooks/use-notification-system"

interface Alert {
  id: string
  type: "low_stock" | "out_of_stock" | "reorder" | "expiry"
  productName: string
  message: string
  severity: "high" | "medium" | "low"
  timestamp: string
  acknowledged: boolean
}

interface Product {
  id: string
  name: string
  currentStock: number
  minThreshold: number
}

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "staff"
}

interface AlertsPanelProps {
  alerts: Alert[]
  products?: Product[]
  user?: User | null
  onNavigateToDashboard?: () => void
  onOpenUpdateStock?: (product: Product) => void
}

export function AlertsPanel({
  alerts,
  products = [],
  user,
  onNavigateToDashboard,
  onOpenUpdateStock,
}: AlertsPanelProps) {
  const { settings, updateSetting, isLoaded } = useNotificationSettings()
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<string[]>([])

  // Initialize notification system
  useNotificationSystem(products, alerts, settings, user)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "default"
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "low_stock":
      case "out_of_stock":
        return <AlertTriangle className="h-4 w-4" />
      case "reorder":
        return <Bell className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const acknowledgeAlert = (alertId: string) => {
    const alert = alerts.find((a) => a.id === alertId)
    if (alert && products && onNavigateToDashboard && onOpenUpdateStock) {
      // Find the product by name
      const product = products.find((p) => p.name === alert.productName)
      if (product) {
        // Navigate to dashboard
        onNavigateToDashboard()
        // Open update stock dialog for this product
        setTimeout(() => {
          onOpenUpdateStock(product)
        }, 100) // Small delay to ensure tab switch completes
      }
    }

    // Mark alert as acknowledged
    setAcknowledgedAlerts((prev) => [...prev, alertId])
  }

  const dismissAlert = (alertId: string) => {
    setAcknowledgedAlerts((prev) => [...prev, alertId])
  }

  const testNotification = () => {
    if (settings.browser && "Notification" in window && Notification.permission === "granted") {
      new Notification("InventoryPro Test Notification", {
        body: "Notification system is working correctly!",
        icon: "/placeholder.svg?height=64&width=64&text=✅",
      })
    } else {
      alert("Please enable browser notifications first!")
    }
  }

  const highPriorityAlerts = alerts.filter((a) => a.severity === "high" && !a.acknowledged)
  const mediumPriorityAlerts = alerts.filter((a) => a.severity === "medium" && !a.acknowledged)
  const lowPriorityAlerts = alerts.filter((a) => a.severity === "low" && !a.acknowledged)

  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 dark:text-gray-400">Loading notification settings...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{highPriorityAlerts.length}</div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">Immediate attention required</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">Medium Priority</CardTitle>
            <Bell className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{mediumPriorityAlerts.length}</div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">Monitor closely</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">Low Priority</CardTitle>
            <Bell className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{lowPriorityAlerts.length}</div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">For your information</p>
          </CardContent>
        </Card>
      </div>

      {/* Notification Settings */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-sm font-medium dark:text-white">
            <Settings className="h-4 w-4" />
            <span>Notification Settings</span>
          </CardTitle>
          <CardDescription className="dark:text-gray-400">
            Configure how you want to receive inventory alerts. Settings are saved automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4 text-blue-500" />
                <div>
                  <Label htmlFor="browser-notifications" className="dark:text-white font-medium">
                    Browser Notifications
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Get instant notifications for critical stock alerts
                  </p>
                </div>
              </div>
              <Switch
                id="browser-notifications"
                checked={settings.browser}
                onCheckedChange={(checked) => updateSetting("browser", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-green-500" />
                <div>
                  <Label htmlFor="email-notifications" className="dark:text-white font-medium">
                    Email Notifications
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Receive detailed reports via email</p>
                </div>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.email}
                onCheckedChange={(checked) => updateSetting("email", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-purple-500" />
                <div>
                  <Label htmlFor="slack-notifications" className="dark:text-white font-medium">
                    Slack Notifications
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Send alerts to your team Slack channel</p>
                </div>
              </div>
              <Switch
                id="slack-notifications"
                checked={settings.slack}
                onCheckedChange={(checked) => updateSetting("slack", checked)}
              />
            </div>
          </div>

          <div className="pt-4 border-t dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium dark:text-white">Test Notifications</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Send a test notification to verify your settings
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={testNotification}>
                Test Now
              </Button>
            </div>
          </div>

          {user && (
            <div className="pt-4 border-t dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <p>
                  <strong>User:</strong> {user.name} ({user.role})
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Browser Permission:</strong>{" "}
                  {typeof window !== "undefined" && "Notification" in window
                    ? Notification.permission
                    : "Not supported"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-sm font-medium dark:text-white">Active Alerts</CardTitle>
          <CardDescription className="dark:text-gray-400">Current inventory alerts requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts
              .filter((alert) => !alert.acknowledged && !acknowledgedAlerts.includes(alert.id))
              .map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start space-x-4 p-4 border rounded-lg dark:border-gray-700 dark:bg-gray-750"
                >
                  <div className="flex-shrink-0 mt-1">{getAlertIcon(alert.type)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium dark:text-white">{alert.productName}</h4>
                      <Badge variant={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{alert.message}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => acknowledgeAlert(alert.id)}>
                      <Check className="h-3 w-3 mr-1" />
                      Acknowledge
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => dismissAlert(alert.id)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}

            {alerts.filter((alert) => !alert.acknowledged && !acknowledgedAlerts.includes(alert.id)).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="dark:text-gray-300">No active alerts</p>
                <p className="text-sm dark:text-gray-400">All inventory levels are within normal ranges</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
