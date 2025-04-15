
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { saveAs } from "file-saver";
import AzureLogSimulator from "./azureLogSimulator";

// Default report options
export const defaultReportOptions = {
  type: "pdf",
  content: "all",
  timeRange: "24h",
  includeResolvedThreats: true
};

class ReportGenerator {
  formatTimestamp(timestamp: string): string {
    return AzureLogSimulator.formatToIST(timestamp);
  }

  // Generate PDF report
  async generatePDFReport(threats: any[], logs: any[], options: any) {
    const doc = new jsPDF();
    const now = new Date();
    const reportDate = AzureLogSimulator.formatToIST(now.toISOString());

    // Add header
    doc.setFontSize(18);
    doc.text("SENTINEL AGS - Security Report", 14, 20);
    doc.setFontSize(11);
    doc.text(`Generated on: ${reportDate}`, 14, 28);
    doc.text(`Report period: ${this.getReportPeriodText(options.timeRange)}`, 14, 35);

    // Add threats section
    if (options.content === "threats" || options.content === "all") {
      doc.setFontSize(14);
      doc.text("Detected Threats", 14, 45);

      // Filter threats based on options
      const filteredThreats = this.filterThreats(threats, options);
      if (filteredThreats.length > 0) {
        const threatData = filteredThreats.map(threat => [
          this.formatTimestamp(threat.timestamp),
          threat.title,
          threat.severity,
          threat.status,
          threat.source || "Unknown"
        ]);

        autoTable(doc, {
          startY: 50,
          head: [["Timestamp", "Threat", "Severity", "Status", "Source"]],
          body: threatData,
          theme: "striped",
          headStyles: { fillColor: [40, 45, 60] }
        });
      } else {
        doc.setFontSize(11);
        doc.text("No threats found in the selected time period.", 14, 55);
      }
    }

    // Add logs section
    if (options.content === "logs" || options.content === "all") {
      // Calculate Y position for logs section
      const currentY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 50;

      doc.setFontSize(14);
      doc.text("Azure Logs", 14, currentY);

      // Filter logs based on timeRange
      const filteredLogs = this.filterLogs(logs, options);
      if (filteredLogs.length > 0) {
        const logData = filteredLogs.map(log => [
          this.formatTimestamp(log.timestamp),
          log.level,
          log.source?.split('/').pop() || "Unknown",
          log.message?.substring(0, 50) + (log.message?.length > 50 ? "..." : "") || ""
        ]);

        autoTable(doc, {
          startY: currentY + 5,
          head: [["Timestamp", "Level", "Source", "Message"]],
          body: logData,
          theme: "striped",
          headStyles: { fillColor: [40, 45, 60] }
        });
      } else {
        doc.setFontSize(11);
        doc.text("No logs found in the selected time period.", 14, currentY + 10);
      }
    }

    // Add footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Page ${i} of ${pageCount} - SENTINEL AGS Security Report - CONFIDENTIAL`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
    }

    // Save the PDF
    const fileName = `security_report_${now.getTime()}.pdf`;
    doc.save(fileName);
  }

  // Generate CSV report
  async generateCSVReport(threats: any[], logs: any[], options: any) {
    let csvContent = "";
    const now = new Date();

    // Generate threats CSV
    if (options.content === "threats" || options.content === "all") {
      // Filter threats
      const filteredThreats = this.filterThreats(threats, options);
      if (filteredThreats.length > 0) {
        csvContent += "DETECTED THREATS\n";
        csvContent += "Timestamp,Title,Type,Severity,Status,Source\n";
        filteredThreats.forEach(threat => {
          csvContent += `"${this.formatTimestamp(threat.timestamp)}","${threat.title}","${threat.type || "Unknown"}","${threat.severity}","${threat.status}","${threat.source || "Unknown"}"\n`;
        });
        csvContent += "\n";
      }
    }

    // Generate logs CSV
    if (options.content === "logs" || options.content === "all") {
      // Filter logs
      const filteredLogs = this.filterLogs(logs, options);
      if (filteredLogs.length > 0) {
        csvContent += "AZURE LOGS\n";
        csvContent += "Timestamp,Level,Source,Message\n";
        filteredLogs.forEach(log => {
          // Escape quotes in message for CSV
          const message = log.message?.replace(/"/g, '""') || "";
          const source = log.source?.replace(/"/g, '""') || "Unknown";
          csvContent += `"${this.formatTimestamp(log.timestamp)}","${log.level}","${source}","${message}"\n`;
        });
      }
    }

    // Create and save the CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const fileName = `security_report_${now.getTime()}.csv`;
    saveAs(blob, fileName);
  }

  // Generate a report based on options
  async generateReport(threats: any[], logs: any[], options = defaultReportOptions) {
    try {
      if (options.type === "pdf") {
        await this.generatePDFReport(threats, logs, options);
      } else if (options.type === "csv") {
        await this.generateCSVReport(threats, logs, options);
      }
    } catch (error) {
      console.error("Error generating report:", error);
      throw new Error("Failed to generate report");
    }
  }

  // Helper to filter threats based on options
  filterThreats(threats: any[], options: any) {
    return threats.filter(threat => {
      // Filter by status
      if (!options.includeResolvedThreats && threat.status === "resolved") {
        return false;
      }

      // Filter by time range
      if (options.timeRange !== "all") {
        const threatTime = new Date(threat.timestamp).getTime();
        const now = new Date().getTime();
        const timeCutoff = this.getTimeCutoff(options.timeRange);
        if (threatTime < timeCutoff || threatTime > now) {
          return false;
        }
      }
      return true;
    });
  }

  // Helper to filter logs based on options
  filterLogs(logs: any[], options: any) {
    return logs.filter(log => {
      // Filter by time range
      if (options.timeRange !== "all") {
        const logTime = new Date(log.timestamp).getTime();
        const now = new Date().getTime();
        const timeCutoff = this.getTimeCutoff(options.timeRange);
        if (logTime < timeCutoff || logTime > now) {
          return false;
        }
      }
      return true;
    });
  }

  // Helper to get time cutoff based on selected range
  getTimeCutoff(timeRange: string) {
    const now = new Date().getTime();
    switch (timeRange) {
      case "24h":
        return now - 24 * 60 * 60 * 1000;
      case "7d":
        return now - 7 * 24 * 60 * 60 * 1000;
      case "30d":
        return now - 30 * 24 * 60 * 60 * 1000;
      default:
        return 0;
    }
  }

  // Helper to get report period text
  getReportPeriodText(timeRange: string) {
    switch (timeRange) {
      case "24h":
        return "Last 24 hours";
      case "7d":
        return "Last 7 days";
      case "30d":
        return "Last 30 days";
      default:
        return "All time";
    }
  }
}

export default new ReportGenerator();
