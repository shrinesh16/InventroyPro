interface LogData {
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

export class PDFService {
  static async generateDailyReport(logs: LogData[]): Promise<void> {
    try {
      // Import jsPDF dynamically to avoid SSR issues
      const jsPDF = (await import("jspdf")).jsPDF
      const autoTable = (await import("jspdf-autotable")).default

      const doc = new jsPDF()

      // Set up the document
      this.addHeader(doc)
      this.addSummary(doc, logs)
      this.addTable(doc, logs, autoTable)
      this.addFooter(doc)

      // Generate filename with current date
      const today = new Date()
      const dateStr = today.toISOString().split("T")[0]
      const filename = `inventory-daily-report-${dateStr}.pdf`

      // Save the PDF
      doc.save(filename)

      console.log(`PDF generated successfully: ${filename}`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      throw new Error("Failed to generate PDF report")
    }
  }

  private static addHeader(doc: any): void {
    // Company logo area (placeholder)
    doc.setFillColor(59, 130, 246) // Blue color
    doc.rect(20, 10, 170, 25, "F")

    // Company name and title
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.text("InventoryPro", 25, 25)

    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text("Daily Activity Report", 25, 32)

    // Date
    doc.setTextColor(40, 40, 40)
    doc.setFontSize(10)
    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    doc.text(`Report Date: ${today}`, 20, 45)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 52)
  }

  private static addSummary(doc: any, logs: LogData[]): void {
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(40, 40, 40)
    doc.text("Daily Summary", 20, 65)

    // Calculate summary statistics
    const totalActivities = logs.length
    const stockAdditions = logs.filter((log) => log.action === "add").length
    const stockRemovals = logs.filter((log) => log.action === "remove").length
    const priceChanges = logs.filter((log) => log.priceChange).length
    const supplierChanges = logs.filter((log) => log.supplierChange).length

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")

    const summaryY = 75
    const lineHeight = 6

    doc.text(`• Total Activities: ${totalActivities}`, 25, summaryY)
    doc.text(`• Stock Additions: ${stockAdditions}`, 25, summaryY + lineHeight)
    doc.text(`• Stock Removals: ${stockRemovals}`, 25, summaryY + lineHeight * 2)
    doc.text(`• Price Changes: ${priceChanges}`, 25, summaryY + lineHeight * 3)
    doc.text(`• Supplier Changes: ${supplierChanges}`, 25, summaryY + lineHeight * 4)
  }

  private static addTable(doc: any, logs: LogData[], autoTable: any): void {
    // Prepare table data
    const tableData = logs.map((log) => {
      const time = new Date(log.timestamp).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })

      let notes = log.notes || ""

      // Add price and supplier changes to notes
      if (log.priceChange) {
        notes += `${notes ? " | " : ""}Price: RS:${log.priceChange.from} → RS:${log.priceChange.to}`
      }
      if (log.supplierChange) {
        notes += `${notes ? " | " : ""}Supplier: ${log.supplierChange.from} → ${log.supplierChange.to}`
      }

      return [
        time,
        log.productName,
        log.action.toUpperCase(),
        log.quantity.toString(),
        `${log.previousStock} → ${log.newStock}`,
        log.user,
        notes || "-",
      ]
    })

    // Add the table
    autoTable(doc, {
      head: [["Time", "Product", "Action", "Qty", "Stock Change", "User", "Notes"]],
      body: tableData,
      startY: 115,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: "linebreak",
        halign: "left",
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 18 }, // Time
        1: { cellWidth: 35 }, // Product
        2: { cellWidth: 18 }, // Action
        3: { cellWidth: 12 }, // Quantity
        4: { cellWidth: 25 }, // Stock Change
        5: { cellWidth: 25 }, // User
        6: { cellWidth: 57 }, // Notes
      },
      margin: { top: 115, left: 10, right: 10 },
      tableWidth: "auto",
    })
  }

  private static addFooter(doc: any): void {
    const pageCount = doc.internal.getNumberOfPages()

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)

      // Left footer
      doc.text(`InventoryPro - Inventory Management System`, 20, doc.internal.pageSize.height - 10)

      // Right footer
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10, {
        align: "right",
      })
    }
  }
}
