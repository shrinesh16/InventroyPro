"use client"

import { useState, useEffect } from "react"

interface NotificationSettings {
  browser: boolean
  email: boolean
  slack: boolean
}

const DEFAULT_SETTINGS: NotificationSettings = {
  browser: true,
  email: true,
  slack: false,
}

export function useNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("inventory-notification-settings")
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(parsed)
      } catch (error) {
        console.error("Failed to parse notification settings:", error)
        setSettings(DEFAULT_SETTINGS)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("inventory-notification-settings", JSON.stringify(settings))
    }
  }, [settings, isLoaded])

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))

    // Request browser notification permission if enabling browser notifications
    if (key === "browser" && value && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          if (permission !== "granted") {
            console.warn("Browser notifications permission denied")
          }
        })
      }
    }
  }

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS)
  }

  return {
    settings,
    updateSetting,
    resetSettings,
    isLoaded,
  }
}
