"use client"

import { useEffect, useRef } from "react"

interface Product {
  id: string
  name: string
  currentStock: number
  minThreshold: number
}

interface Alert {
  id: string
  type: string
  productName: string
  message: string
  severity: "high" | "medium" | "low"
  timestamp: string
  acknowledged: boolean
}

interface NotificationSettings {
  browser: boolean
  email: boolean
  slack: boolean
}

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "staff"
}

export function useNotificationSystem(
  products: Product[],
  alerts: Alert[],
  settings: NotificationSettings,
  user: User | null,
) {
  const lastNotifiedProducts = useRef<Set<string>>(new Set())
  const notificationQueue = useRef<Alert[]>([])

  // Check for low stock and send notifications
  useEffect(() => {
    if (!user || !settings.browser) return

    const lowStockProducts = products.filter(
      (product) => product.currentStock <= product.minThreshold && !lastNotifiedProducts.current.has(product.id),
    )

    lowStockProducts.forEach((product) => {
      const severity =
        product.currentStock === 0 ? "high" : product.currentStock <= product.minThreshold / 2 ? "high" : "medium"

      const alert: Alert = {
        id: `notification-${product.id}-${Date.now()}`,
        type: product.currentStock === 0 ? "out_of_stock" : "low_stock",
        productName: product.name,
        message:
          product.currentStock === 0
            ? "Product is out of stock!"
            : `Stock level is low: ${product.currentStock}/${product.minThreshold} units remaining`,
        severity,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      }

      // Send browser notification
      sendBrowserNotification(alert, user)

      // Send email notification (simulated)
      if (settings.email) {
        sendEmailNotification(alert, user)
      }

      // Send Slack notification (simulated)
      if (settings.slack) {
        sendSlackNotification(alert, user)
      }

      // Mark as notified
      lastNotifiedProducts.current.add(product.id)
    })

    // Clean up notified products that are no longer low stock
    const currentLowStockIds = new Set(products.filter((p) => p.currentStock <= p.minThreshold).map((p) => p.id))
    lastNotifiedProducts.current = new Set([...lastNotifiedProducts.current].filter((id) => currentLowStockIds.has(id)))
  }, [products, settings, user])

  // Process high priority alerts
  useEffect(() => {
    if (!user || !settings.browser) return

    const highPriorityAlerts = alerts.filter(
      (alert) => alert.severity === "high" && !alert.acknowledged && !notificationQueue.current.includes(alert),
    )

    highPriorityAlerts.forEach((alert) => {
      sendBrowserNotification(alert, user)
      notificationQueue.current.push(alert)
    })

    // Clean up processed alerts
    notificationQueue.current = notificationQueue.current.filter((queuedAlert) =>
      alerts.some((alert) => alert.id === queuedAlert.id && !alert.acknowledged),
    )
  }, [alerts, settings, user])

  const sendBrowserNotification = (alert: Alert, user: User) => {
    if (!settings.browser || !("Notification" in window)) return

    if (Notification.permission === "granted") {
      const notification = new Notification(`InventoryPro Alert - ${alert.productName}`, {
        body: alert.message,
        icon: "/placeholder.svg?height=64&width=64&text=📦",
        badge: "/placeholder.svg?height=32&width=32&text=!",
        tag: `inventory-${alert.productName}`, // Prevent duplicate notifications
        requireInteraction: alert.severity === "high",
        silent: alert.severity === "low",
      })

      notification.onclick = () => {
        window.focus()
        notification.close()
      }

      // Auto-close after 10 seconds for non-critical alerts
      if (alert.severity !== "high") {
        setTimeout(() => {
          notification.close()
        }, 10000)
      }

      console.log(`🔔 Browser notification sent to ${user.name} (${user.role}):`, alert.message)
    } else if (Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          sendBrowserNotification(alert, user)
        }
      })
    }
  }

  const sendEmailNotification = (alert: Alert, user: User) => {
    // Simulate email notification
    console.log(`📧 Email notification sent to ${user.email}:`, {
      subject: `InventoryPro Alert: ${alert.productName}`,
      body: alert.message,
      priority: alert.severity,
      timestamp: alert.timestamp,
    })

    // In a real application, this would call an email service API
    // Example: emailService.send({ to: user.email, subject: ..., body: ... })
  }

  const sendSlackNotification = (alert: Alert, user: User) => {
    // Simulate Slack notification
    const slackMessage = {
      channel: "#inventory-alerts",
      username: "InventoryPro Bot",
      text: `🚨 *${alert.severity.toUpperCase()} PRIORITY ALERT*`,
      attachments: [
        {
          color: alert.severity === "high" ? "danger" : alert.severity === "medium" ? "warning" : "good",
          fields: [
            {
              title: "Product",
              value: alert.productName,
              short: true,
            },
            {
              title: "Alert Type",
              value: alert.type.replace("_", " ").toUpperCase(),
              short: true,
            },
            {
              title: "Message",
              value: alert.message,
              short: false,
            },
            {
              title: "Assigned to",
              value: `${user.name} (${user.role})`,
              short: true,
            },
          ],
          footer: "InventoryPro",
          ts: Math.floor(new Date(alert.timestamp).getTime() / 1000),
        },
      ],
    }

    console.log(`💬 Slack notification sent:`, slackMessage)

    // In a real application, this would call the Slack API
    // Example: slackService.send(slackMessage)
  }

  return {
    sendBrowserNotification,
    sendEmailNotification,
    sendSlackNotification,
  }
}
