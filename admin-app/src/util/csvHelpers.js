import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Filter data based on a timeframe (week, month, year)
 * @param {Array} data - The array of objects to filter
 * @param {string} dateField - The field name containing the timestamp (e.g., 'timestamp' or 'data_logged')
 * @param {string} timeframe - 'week', 'month', 'year', or 'all'
 */
const filterByTimeframe = (data, dateField, timeframe) => {
  if (!timeframe || timeframe === 'all') return data;

  const now = new Date();
  const startOfPeriod = new Date();

  if (timeframe === 'week') {
    startOfPeriod.setDate(now.getDate() - 7);
  } else if (timeframe === 'month') {
    startOfPeriod.setMonth(now.getMonth() - 1);
  } else if (timeframe === 'year') {
    startOfPeriod.setFullYear(now.getFullYear() - 1);
  }

  return data.filter(item => {
    const itemDate = new Date(item[dateField]);
    return itemDate >= startOfPeriod && itemDate <= now;
  });
};

const getTimestampedFilename = (prefix, timeframe = 'all') => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toLocaleTimeString().replace(/:/g, '-').replace(/\s/g, '');
  const timeframeSuffix = timeframe !== 'all' ? `_last_${timeframe}` : '';
  return `${prefix}${timeframeSuffix}_${dateStr}_${timeStr}`;
};

// --- Audit Log Exports ---

export const downloadAuditCSV = (data, timeframe = 'all') => {
  const filteredData = filterByTimeframe(data, 'timestamp', timeframe);
  const generatedAt = `Report Generated: ${new Date().toLocaleString()} (Filter: ${timeframe})`;
  const headers = ["Date", "Librarian", "Student ID", "Old Status", "New Status", "Remarks"];
  
  const rows = filteredData.map(log => [
    new Date(log.timestamp).toLocaleString(),
    log.editor_name || 'System',
    log.student_id,
    log.old_status,
    log.new_status,
    `"${log.remarks || ''}"`
  ]);

  const csvContent = [generatedAt, "", headers, ...rows]
    .map(e => Array.isArray(e) ? e.join(",") : e)
    .join("\n");

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", `${getTimestampedFilename("audit_trail", timeframe)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadAuditPDF = (data, timeframe = 'all') => {
  const filteredData = filterByTimeframe(data, 'timestamp', timeframe);
  const doc = new jsPDF();
  const generatedAt = `Report Generated: ${new Date().toLocaleString()} (Filter: ${timeframe})`;
  
  doc.setFontSize(16);
  doc.text("Audit Trail Report", 14, 15);
  doc.setFontSize(10);
  doc.text(generatedAt, 14, 22);

  const headers = [["Date", "Librarian", "Student ID", "Old Status", "New Status", "Remarks"]];
  const rows = filteredData.map(log => [
    new Date(log.timestamp).toLocaleString(),
    log.editor_name || 'System',
    log.student_id,
    log.old_status,
    log.new_status,
    log.remarks || ''
  ]);

  autoTable(doc, {
    startY: 30,
    head: headers,
    body: rows,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [58, 134, 255] } 
  });

  doc.save(`${getTimestampedFilename("audit_trail", timeframe)}.pdf`);
};

// --- Clearance Report Exports ---

export const downloadClearanceReportCSV = (reportData, timeframe = 'all') => {
  const filteredData = filterByTimeframe(reportData, 'data_logged', timeframe);
  const generatedAt = `Report Generated: ${new Date().toLocaleString()} (Filter: ${timeframe})`;
  const headers = ["Date Logged", "Student Number", "Full Name", "Program", "Purpose", "Status", "Verified By"];
  
  const rows = filteredData.map(item => {
    const s = item.student || {};
    const l = item.librarian || {};
    return [
      new Date(item.data_logged).toLocaleDateString(),
      s.student_number || 'N/A',
      `"${s.first_name} ${s.last_name}"`,
      s.program || 'N/A',
      `"${s.purpose_of_clearance || ''}"`,
      item.clearance_status,
      l.first_name ? `"${l.first_name} ${l.last_name}"` : 'Pending'
    ];
  });

  const csvContent = [generatedAt, "", headers, ...rows]
    .map(e => Array.isArray(e) ? e.join(",") : e)
    .join("\n");

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", `${getTimestampedFilename("clearance_report", timeframe)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadClearanceReportPDF = (reportData, timeframe = 'all') => {
  const filteredData = filterByTimeframe(reportData, 'data_logged', timeframe);
  const doc = new jsPDF();
  const generatedAt = `Report Generated: ${new Date().toLocaleString()} (Filter: ${timeframe})`;
  
  doc.setFontSize(16);
  doc.text("Clearance Report", 14, 15);
  doc.setFontSize(10);
  doc.text(generatedAt, 14, 22);

  const headers = [["Date Logged", "Student Number", "Full Name", "Program", "Purpose", "Status", "Verified By"]];
  const rows = filteredData.map(item => {
    const s = item.student || {};
    const l = item.librarian || {};
    return [
      new Date(item.data_logged).toLocaleDateString(),
      s.student_number || 'N/A',
      `${s.first_name} ${s.last_name}`,
      s.program || 'N/A',
      item.purpose_of_clearance || '',
      item.clearance_status,
      l.first_name ? `${l.first_name} ${l.last_name}` : 'Pending'
    ];
  });

  autoTable(doc, {
    startY: 30,
    head: headers,
    body: rows,
    theme: 'striped',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [255, 199, 44], textColor: [0, 0, 0] } 
  });

  doc.save(`${getTimestampedFilename("clearance_report", timeframe)}.pdf`);
};