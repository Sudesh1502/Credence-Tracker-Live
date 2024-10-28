import { saveAs } from 'file-saver';
import XLSX from 'xlsx';
import jsPDF from 'jspdf';

// Function to download report as Excel
const downloadExcel = (data) => {
  const ws = XLSX.utils.json_to_sheet(data.map((row) => ({
    Date: row.date,
    'First Ignition On': row.firstIgnitionTrueFromStart
      ? dayjs(row.firstIgnitionTrueFromStart.deviceTime).format("YYYY-MM-DD HH:mm:ss")
      : 'N/A',
    'Last Ignition Off': row.firstIgnitionTrueFromEnd
      ? dayjs(row.firstIgnitionTrueFromEnd.deviceTime).format("YYYY-MM-DD HH:mm:ss")
      : 'N/A',
    Duration: row.duration !== null ? formatDuration(row.duration) : 'N/A',
    'Total Distance Covered (km)': Math.min(row.totalDistance / 1000, 1011).toFixed(2),
  })));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Day Report');
  XLSX.writeFile(wb, 'Day_Report.xlsx');
};

// Function to download report as PDF
const downloadPDF = (data) => {
  const doc = new jsPDF();

  // Set title
  doc.setFontSize(20);
  doc.text('Day Report', 14, 22);

  // Add table headers
  doc.setFontSize(12);
  const headers = ['Date', 'First Ignition On', 'Last Ignition Off', 'Duration', 'Total Distance Covered (km)'];
  const widths = [40, 50, 50, 40, 50];

  headers.forEach((header, index) => {
    doc.text(header, 14 + index * widths[index], 40);
  });

  // Add table rows
  data.forEach((row, rowIndex) => {
    doc.text(row.date, 14, 50 + rowIndex * 10);
    doc.text(row.firstIgnitionTrueFromStart
      ? dayjs(row.firstIgnitionTrueFromStart.deviceTime).format("YYYY-MM-DD HH:mm:ss")
      : 'N/A', 14 + widths[0], 50 + rowIndex * 10);
    doc.text(row.firstIgnitionTrueFromEnd
      ? dayjs(row.firstIgnitionTrueFromEnd.deviceTime).format("YYYY-MM-DD HH:mm:ss")
      : 'N/A', 14 + widths[0] + widths[1], 50 + rowIndex * 10);
    doc.text(row.duration !== null ? formatDuration(row.duration) : 'N/A', 14 + widths[0] + widths[1] + widths[2], 50 + rowIndex * 10);
    doc.text(Math.min(row.totalDistance / 1000, 1011).toFixed(2), 14 + widths[0] + widths[1] + widths[2] + widths[3], 50 + rowIndex * 10);
  });

  doc.save('Day_Report.pdf');
};
