// Utility function to export data as CSV
export function exportToCSV(data: any[], filename: string) {
    if (!data || data.length === 0) {
        return
    }

    // Get headers from first object
    const headers = Object.keys(data[0])

    // Create CSV rows
    const csvRows = [
        headers.join(","), // Header row
        ...data.map((row) =>
            headers
                .map((header) => {
                    const value = row[header]
                    // Handle values that might contain commas or quotes
                    if (value === null || value === undefined) return ""
                    const stringValue = String(value)
                    if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
                        return `"${stringValue.replace(/"/g, '""')}"`
                    }
                    return stringValue
                })
                .join(","),
        ),
    ]

    // Create blob and download
    const csvContent = csvRows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", `${filename}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}
