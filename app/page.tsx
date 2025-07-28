"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProductDashboard } from "@/components/product-dashboard"
import { AlertsPanel } from "@/components/alerts-panel"
import { EnhancedReportsPanel } from "@/components/enhanced-reports-panel"
import { EnhancedActivityLogs } from "@/components/enhanced-activity-logs"
import { ShipmentsPanel } from "@/components/shipments-panel"
import { LoginForm } from "@/components/login-form"
import { useAuth } from "@/hooks/use-auth"
import { useInventory } from "@/hooks/use-inventory"
import { useShipments } from "@/hooks/use-shipments"

export default function HomePage() {
  const { user, login, logout } = useAuth()
  const { products, alerts, logs, categories, updateStock, addProduct } = useInventory()
  const { shipments, shipmentLogs, addToShipment, removeFromShipment, getTotalGSTAmount } = useShipments()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isDarkTheme, setIsDarkTheme] = useState(false)
  const [productToUpdate, setProductToUpdate] = useState<any>(null)

  if (!user) {
    return (
      <div className={isDarkTheme ? "dark" : ""}>
        <LoginForm onLogin={login} />
      </div>
    )
  }

  return (
    <div className={isDarkTheme ? "dark" : ""}>
      <DashboardLayout
        user={user}
        onLogout={logout}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isDarkTheme={isDarkTheme}
        onThemeChange={setIsDarkTheme}
      >
        {activeTab === "dashboard" && (
          <ProductDashboard
            products={products}
            categories={categories}
            onUpdateStock={updateStock}
            onAddProduct={addProduct}
            userRole={user.role}
            productToUpdate={productToUpdate}
            onProductUpdateHandled={() => setProductToUpdate(null)}
          />
        )}
        {activeTab === "shipments" && (
          <ShipmentsPanel
            products={products}
            shipments={shipments}
            categories={categories}
            onAddToShipment={addToShipment}
            onRemoveFromShipment={removeFromShipment}
            onUpdateStock={updateStock}
            userRole={user.role}
          />
        )}
        {activeTab === "alerts" && (
          <AlertsPanel
            alerts={alerts}
            products={products}
            user={user}
            onNavigateToDashboard={() => setActiveTab("dashboard")}
            onOpenUpdateStock={(product) => setProductToUpdate(product)}
          />
        )}
        {activeTab === "reports" && <EnhancedReportsPanel products={products} logs={logs} shipments={shipments} />}
        {activeTab === "logs" && <EnhancedActivityLogs logs={logs} shipmentLogs={shipmentLogs} />}
      </DashboardLayout>
    </div>
  )
}
