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
  gstAmount: number
  totalValue: number
}

interface ReportData {
  products: Product[]
  logs: Log[]
  shipments?: ShipmentItem[]
  timeRange: string
  categoryData: any[]
  stockLevelData: any[]
  trendData: any[]
  filteredLogs: Log[]
  reportType?: "inventory" | "shipment"
}

export class ReportsPDFService {
  static async generateReport(data: ReportData): Promise<void> {
    try {
      // Import jsPDF dynamically to avoid SSR issues
      const jsPDF = (await import("jspdf")).jsPDF
      const autoTable = (await import("jspdf-autotable")).default

      const doc = new jsPDF()

      // Set up the document
      this.addHeader(doc, data.timeRange, data.reportType || "inventory")
      this.addExecutiveSummary(doc, data)

      if (data.reportType === "shipment" && data.shipments) {
        this.addShipmentAnalysis(doc, data.shipments, autoTable)
      } else {
        this.addCategoryAnalysis(doc, data.categoryData, autoTable)
        this.addStockAnalysis(doc, data.stockLevelData, autoTable)
      }

      this.addActivitySummary(doc, data.filteredLogs, autoTable)
      this.addTrendAnalysis(doc, data.trendData)
      this.addRecommendations(doc, data)
      this.addFooter(doc)

      // Generate filename with current date and time range
      const today = new Date()
      const dateStr = today.toISOString().split("T")[0]
      const timeRangeText = this.getTimeRangeText(data.timeRange)
      const reportTypeText = data.reportType === "shipment" ? "shipment" : "inventory"
      const filename = `${reportTypeText}-report-${timeRangeText.toLowerCase().replace(/\s+/g, "-")}-${dateStr}.pdf`

      // Save the PDF
      doc.save(filename)

      console.log(`Report PDF generated successfully: ${filename}`)
    } catch (error) {
      console.error("Error generating report PDF:", error)
      throw new Error("Failed to generate report PDF")
    }
  }

  private static getTimeRangeText(timeRange: string): string {
    const ranges = {
      "7d": "Last 7 Days",
      "30d": "Last 30 Days",
      "90d": "Last 90 Days",
      "1y": "Last Year",
    }
    return ranges[timeRange as keyof typeof ranges] || "Custom Range"
  }

  private static addHeader(doc: any, timeRange: string, reportType: string): void {
    // Company header with gradient-like effect
    doc.setFillColor(59, 130, 246)
    doc.rect(20, 10, 170, 30, "F")

    // Company name and title
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text("InventoryPro", 25, 25)

    doc.setFontSize(14)
    doc.setFont("helvetica", "normal")
    const reportTitle = reportType === "shipment" ? "Shipment Analysis Report" : "Inventory Analysis Report"
    doc.text(reportTitle, 25, 33)

    // Report details
    doc.setTextColor(40, 40, 40)
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text(`Report Period: ${this.getTimeRangeText(timeRange)}`, 20, 50)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    doc.text(`Generated: ${today} at ${new Date().toLocaleTimeString()}`, 20, 57)
  }

  private static addExecutiveSummary(doc: any, data: ReportData): void {
    const startY = 70

    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(40, 40, 40)
    doc.text("Executive Summary", 20, startY)

    let summaryData: any[] = []

    if (data.reportType === "shipment" && data.shipments && data.shipments.length > 0) {
      // Shipment summary with proper validation
      const validShipments = data.shipments.filter((s) => s && typeof s.totalValue === "number")
      const totalShipments = validShipments.length
      const totalValue = validShipments.reduce((sum, s) => sum + (s.totalValue || 0), 0)
      const totalQuantity = validShipments.reduce((sum, s) => sum + (s.quantity || 0), 0)
      const totalGST = validShipments.reduce((sum, s) => sum + (s.gstAmount || 0) * (s.quantity || 0), 0)
      const totalShipping = validShipments.reduce((sum, s) => sum + (s.shippingFee || 0) * (s.quantity || 0), 0)

      summaryData = [
        { label: "Total Shipments", value: totalShipments.toString(), unit: "items" },
        { label: "Total Quantity", value: totalQuantity.toString(), unit: "units" },
        { label: "Total Value", value: `RS:${totalValue.toLocaleString()}`, unit: "" },
        { label: "GST Collected", value: `RS:${totalGST.toLocaleString()}`, unit: "" },
        { label: "Shipping Revenue", value: `RS:${totalShipping.toLocaleString()}`, unit: "" },
      ]
    } else {
      // Inventory summary (existing code)
      const totalProducts = data.products.length
      const totalValue = data.products.reduce((sum, p) => sum + p.currentStock * p.price, 0)
      const lowStockItems = data.products.filter((p) => p.currentStock <= 10).length
      const totalActivities = data.filteredLogs.length
      const avgStockLevel =
        totalProducts > 0 ? Math.round(data.products.reduce((sum, p) => sum + p.currentStock, 0) / totalProducts) : 0

      summaryData = [
        { label: "Total Products", value: totalProducts.toString(), unit: "SKUs" },
        { label: "Total Inventory Value", value: `RS:${totalValue.toLocaleString()}`, unit: "" },
        { label: "Low Stock Items", value: lowStockItems.toString(), unit: "products" },
        { label: "Activities", value: totalActivities.toString(), unit: "transactions" },
        { label: "Avg Stock Level", value: avgStockLevel.toString(), unit: "units/product" },
      ]
    }

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")

    let yPos = startY + 15
    summaryData.forEach((item, index) => {
      const xPos = 20 + (index % 2) * 85
      if (index % 2 === 0 && index > 0) yPos += 20

      // Draw box
      doc.setDrawColor(200, 200, 200)
      doc.rect(xPos, yPos - 5, 80, 15)

      doc.setFont("helvetica", "bold")
      doc.text(item.label, xPos + 2, yPos)
      doc.setFont("helvetica", "normal")
      doc.text(`${item.value} ${item.unit}`, xPos + 2, yPos + 7)
    })
  }

  private static addShipmentAnalysis(doc: any, shipments: ShipmentItem[], autoTable: any): void {
    // Add new page if needed
    if (doc.internal.pageSize.height - doc.lastAutoTable?.finalY < 100) {
      doc.addPage()
    }

    const startY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 20 : 140

    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Shipment Analysis", 20, startY)

    // Validate shipments data
    if (!shipments || shipments.length === 0) {
      doc.setFontSize(10)
      doc.text("No shipment data available", 20, startY + 20)
      return
    }

    // Top shipments by value - with proper null checks
    const topShipments = shipments
      .filter((shipment) => shipment && shipment.productName && typeof shipment.totalValue === "number")
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 10)
      .map((shipment, index) => [
        (index + 1).toString(),
        shipment.productName.length > 25 ? shipment.productName.substring(0, 25) + "..." : shipment.productName,
        (shipment.quantity || 0).toString(),
        `RS:${(shipment.pricePerUnit || 0).toFixed(2)}`,
        `RS:${((shipment.gstAmount || 0) * (shipment.quantity || 0)).toFixed(2)}`,
        `RS:${(shipment.totalValue || 0).toFixed(2)}`,
      ])

    if (topShipments.length > 0) {
      autoTable(doc, {
        head: [["Rank", "Product Name", "Quantity", "Unit Price", "GST Amount", "Total Value"]],
        body: topShipments,
        startY: startY + 10,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
      })
    }

    // Category breakdown with proper validation
    const categoryData = Object.values(
      shipments
        .filter((shipment) => shipment && shipment.category && typeof shipment.totalValue === "number")
        .reduce(
          (acc, shipment) => {
            const category = shipment.category
            if (!acc[category]) {
              acc[category] = { name: category, totalValue: 0, quantity: 0, gstAmount: 0 }
            }
            acc[category].totalValue += shipment.totalValue || 0
            acc[category].quantity += shipment.quantity || 0
            acc[category].gstAmount += (shipment.gstAmount || 0) * (shipment.quantity || 0)
            return acc
          },
          {} as Record<string, any>,
        ),
    )

    if (categoryData.length > 0) {
      const totalShipmentValue = shipments.reduce((sum, s) => sum + (s.totalValue || 0), 0)

      const categoryTableData = categoryData.map((cat: any) => [
        cat.name,
        (cat.quantity || 0).toString(),
        `RS:${(cat.totalValue || 0).toLocaleString()}`,
        `RS:${(cat.gstAmount || 0).toLocaleString()}`,
        totalShipmentValue > 0 ? `${(((cat.totalValue || 0) / totalShipmentValue) * 100).toFixed(1)}%` : "0%",
      ])

      const categoryStartY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 20 : startY + 80
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("Shipments by Category", 20, categoryStartY)

      autoTable(doc, {
        head: [["Category", "Quantity", "Total Value", "GST Amount", "% of Total"]],
        body: categoryTableData,
        startY: categoryStartY + 10,
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
      })
    }
  }

  private static addCategoryAnalysis(doc: any, categoryData: any[], autoTable: any): void {
    // Add new page if needed
    if (doc.internal.pageSize.height - doc.lastAutoTable?.finalY < 100) {
      doc.addPage()
    }

    const startY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 20 : 140

    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Category Analysis", 20, startY)

    // Ensure categoryData has valid structure
    const validCategoryData = categoryData.filter((cat) => cat && cat.name && typeof cat.value === "number")

    if (validCategoryData.length === 0) {
      doc.setFontSize(10)
      doc.text("No category data available", 20, startY + 20)
      return
    }

    // Category breakdown table
    const tableData = validCategoryData.map((cat) => [
      cat.name,
      cat.stock?.toString() || "0",
      `RS:${cat.value.toLocaleString()}`,
      `${((cat.value / validCategoryData.reduce((sum, c) => sum + c.value, 0)) * 100).toFixed(1)}%`,
    ])

    autoTable(doc, {
      head: [["Category", "Total Stock", "Value", "% of Total"]],
      body: tableData,
      startY: startY + 10,
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    })
  }

  private static addStockAnalysis(doc: any, stockLevelData: any[], autoTable: any): void {
    const startY = doc.lastAutoTable.finalY + 20

    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Top Products by Stock Level", 20, startY)

    // Ensure stockLevelData has valid structure
    const validStockData = stockLevelData.filter(
      (product) => product && product.name && typeof product.value === "number",
    )

    if (validStockData.length === 0) {
      doc.setFontSize(10)
      doc.text("No stock data available", 20, startY + 20)
      return
    }

    // Top products table
    const tableData = validStockData
      .slice(0, 10)
      .map((product, index) => [
        (index + 1).toString(),
        product.name,
        product.value.toString(),
        product.value > 50 ? "High" : product.value > 20 ? "Medium" : "Low",
      ])

    autoTable(doc, {
      head: [["Rank", "Product Name", "Current Stock", "Stock Level"]],
      body: tableData,
      startY: startY + 10,
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    })
  }

  private static addActivitySummary(doc: any, logs: Log[], autoTable: any): void {
    const startY = doc.lastAutoTable.finalY + 20

    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Activity Summary", 20, startY)

    // Activity breakdown
    const addActions = logs.filter((log) => log.action === "add").length
    const removeActions = logs.filter((log) => log.action === "remove").length

    const activityData = [
      ["Stock Additions", addActions.toString()],
      ["Stock Removals", removeActions.toString()],
      ["Total Activities", logs.length.toString()],
    ]

    autoTable(doc, {
      head: [["Activity Type", "Count"]],
      body: activityData,
      startY: startY + 10,
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      tableWidth: 100,
    })

    // Recent activities
    if (logs.length > 0) {
      const recentY = doc.lastAutoTable.finalY + 15
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("Recent Activities", 20, recentY)

      const recentLogs = logs
        .slice(0, 5)
        .map((log) => [
          new Date(log.timestamp).toLocaleDateString(),
          log.productName.length > 20 ? log.productName.substring(0, 20) + "..." : log.productName,
          log.action.toUpperCase(),
          log.quantity.toString(),
        ])

      autoTable(doc, {
        head: [["Date", "Product", "Action", "Quantity"]],
        body: recentLogs,
        startY: recentY + 5,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
      })
    }
  }

  private static addTrendAnalysis(doc: any, trendData: any[]): void {
    // Add new page for trends
    doc.addPage()

    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("Trend Analysis", 20, 30)

    // Simple text-based trend representation
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Inventory Value Trends", 20, 50)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")

    if (trendData.length === 0) {
      doc.text("No trend data available for the selected time period", 20, 70)
      return
    }

    let yPos = 60
    trendData.forEach((item, index) => {
      const inventoryTrend =
        index > 0
          ? item.inventory > trendData[index - 1].inventory
            ? "↗"
            : item.inventory < trendData[index - 1].inventory
              ? "↘"
              : "→"
          : "→"

      const salesTrend =
        index > 0
          ? item.sales > trendData[index - 1].sales
            ? "↗"
            : item.sales < trendData[index - 1].sales
              ? "↘"
              : "→"
          : "→"

      doc.text(
        `${item.date}: Inventory RS:${(item.inventory / 1000).toFixed(0)}k ${inventoryTrend} | Sales RS:${(item.sales / 1000).toFixed(0)}k ${salesTrend}`,
        25,
        yPos,
      )
      yPos += 8
    })

    // Trend insights
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Key Insights", 20, yPos + 10)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    const avgInventory = trendData.reduce((sum, item) => sum + item.inventory, 0) / trendData.length
    const avgSales = trendData.reduce((sum, item) => sum + item.sales, 0) / trendData.length
    const lastPeriod = trendData[trendData.length - 1]
    const firstPeriod = trendData[0]

    yPos += 20
    doc.text(`• Average inventory value: RS:${(avgInventory / 1000).toFixed(0)}k`, 25, yPos)
    doc.text(`• Average sales: RS:${(avgSales / 1000).toFixed(0)}k`, 25, yPos + 8)
    doc.text(
      `• Inventory growth: ${(((lastPeriod.inventory - firstPeriod.inventory) / firstPeriod.inventory) * 100).toFixed(1)}%`,
      25,
      yPos + 16,
    )
    doc.text(
      `• Sales growth: ${(((lastPeriod.sales - firstPeriod.sales) / firstPeriod.sales) * 100).toFixed(1)}%`,
      25,
      yPos + 24,
    )
  }

  private static addRecommendations(doc: any, data: ReportData): void {
    const startY = 160

    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Recommendations", 20, startY)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")

    const recommendations = []

    if (data.reportType === "shipment" && data.shipments) {
      // Shipment recommendations
      const totalShipments = data.shipments.length
      const avgShipmentValue =
        totalShipments > 0 ? data.shipments.reduce((sum, s) => sum + s.totalValue, 0) / totalShipments : 0

      if (totalShipments < 5) {
        recommendations.push("• Consider increasing shipment frequency to improve cash flow")
      }

      if (avgShipmentValue < 1000) {
        recommendations.push("• Focus on higher-value shipments to improve profitability")
      }

      recommendations.push("• Review GST calculations for compliance accuracy")
      recommendations.push("• Optimize shipping fees based on market rates")
      recommendations.push("• Consider bulk shipment discounts for large orders")
    } else {
      // Inventory recommendations
      const lowStockItems = data.products.filter((p) => p.currentStock <= 10)
      if (lowStockItems.length > 0) {
        recommendations.push(`• Restock ${lowStockItems.length} low-stock items immediately`)
      }

      // High value category focus
      if (data.categoryData.length > 0) {
        const topCategory = data.categoryData.reduce(
          (max, cat) => (cat.value > max.value ? cat : max),
          data.categoryData[0],
        )
        if (topCategory) {
          recommendations.push(
            `• Focus on ${topCategory.name} category (highest value: RS:${topCategory.value.toLocaleString()})`,
          )
        }
      }

      // Activity-based recommendations
      if (data.filteredLogs.length < 5) {
        recommendations.push("• Increase inventory monitoring frequency")
      }

      // Stock level recommendations
      const avgStock =
        data.products.length > 0 ? data.products.reduce((sum, p) => sum + p.currentStock, 0) / data.products.length : 0
      if (avgStock < 20) {
        recommendations.push("• Consider increasing overall stock levels")
      }
    }

    // General recommendations
    recommendations.push("• Implement automated reorder points for critical items")
    recommendations.push("• Review supplier performance and delivery times")
    recommendations.push("• Consider demand forecasting for better planning")

    let yPos = startY + 15
    recommendations.forEach((rec) => {
      doc.text(rec, 25, yPos)
      yPos += 8
    })
  }

  private static addFooter(doc: any): void {
    const pageCount = doc.internal.getNumberOfPages()

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)

      // Left footer
      doc.text("InventoryPro - Comprehensive Analysis Report", 20, doc.internal.pageSize.height - 10)

      // Right footer
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10, {
        align: "right",
      })

      // Center footer
      doc.text("Confidential - Internal Use Only", doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, {
        align: "center",
      })
    }
  }
}
