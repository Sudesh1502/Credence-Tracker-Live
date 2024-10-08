import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import PageLayout from "../common/components/PageLayout";
import ReportsMenu from "./components/ReportsMenu";
import useReportStyles from "./common/useReportStyles";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone"; // For timezone handling
import utc from "dayjs/plugin/utc"; // For UTC conversion
import { saveAs } from "file-saver"; // For file saving
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

dayjs.extend(utc);
dayjs.extend(timezone);

// Convert backend UTC time to IST for display purposes
const formatTimeToIST = (isoString) => {
  return isoString
    ? dayjs(isoString).tz("Asia/Kolkata").format("HH:mm:ss")
    : "---";
};

// Convert user-selected time from IST to UTC for backend querying
const convertISTToUTC = (dateString) => {
  return dayjs.tz(dateString, "Asia/Kolkata").utc().toISOString();
};

const DayReport = () => {
  const classes = useReportStyles();

  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch devices for dropdown
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await axios.get("/api/devices");
        setDevices(response.data);
      } catch (error) {
        console.error("Error fetching devices:", error);
      }
    };
    fetchDevices();
  }, []);

  // Handle form submission to fetch report data
  const fetchReport = async () => {
    if (!selectedDevice || !dateRange.from || !dateRange.to) {
      alert("Please select a device and date range.");
      return;
    }

    // Convert selected date range from IST to UTC before sending it to the backend
    const fromDate = convertISTToUTC(
      dayjs(dateRange.from).startOf("day").toISOString()
    );
    const toDate = convertISTToUTC(
      dayjs(dateRange.to).endOf("day").toISOString()
    );

    setLoading(true);
    setReportData([]); // Reset report data before fetching new data

    try {
      const response = await axios.get(
        `/api/positions?deviceId=${selectedDevice}&from=${fromDate}&to=${toDate}`
      );

      const data = response.data;
      const groupedByDay = {};
      const resultArray = [];

      // Group data by day
      data.forEach((item) => {
        const date = dayjs(item.deviceTime)
          .tz("Asia/Kolkata")
          .format("YYYY-MM-DD"); // Convert backend UTC to IST for grouping
        if (!groupedByDay[date]) {
          groupedByDay[date] = [];
        }
        groupedByDay[date].push(item);
      });

      // Create result array
      Object.keys(groupedByDay).forEach((day) => {
        const dayData = groupedByDay[day];

        const filteredDayData = dayData.filter((item) => {
          const itemDate = dayjs(item.deviceTime).tz("Asia/Kolkata");
          return (
            itemDate.isSame(dayjs(day).startOf("day"), "day") &&
            itemDate.isAfter(dayjs(day).startOf("day")) &&
            itemDate.isBefore(dayjs(day).endOf("day"))
          );
        });

        const firstIgnitionTrueFromStart = filteredDayData.find(
          (item) => item.attributes.ignition === true
        );

        const firstIgnitionTrueFromEnd = [...filteredDayData]
          .reverse()
          .find((item) => item.attributes.ignition === true);

        const totalDistance = filteredDayData.reduce((sum, item) => {
          // Check if the distance is greater than 500
          if (item.attributes.distance > 500) {
            return sum; // Skip adding this item's distance
          }
          return sum + (item.attributes.distance || 0); // Add the distance to the sum
        }, 0);

        let duration = null;
        if (firstIgnitionTrueFromStart && firstIgnitionTrueFromEnd) {
          duration = dayjs(firstIgnitionTrueFromEnd.deviceTime).diff(
            dayjs(firstIgnitionTrueFromStart.deviceTime),
            "minute"
          );
        }

        resultArray.push({
          date: day,
          firstIgnitionTrueFromStart: firstIgnitionTrueFromStart || null,
          firstIgnitionTrueFromEnd: firstIgnitionTrueFromEnd || null,
          totalDistance: totalDistance,
          duration: duration,
        });
      });

      setReportData(resultArray); // Store result in state
    } catch (error) {
      console.error("Error fetching report data", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (totalMinutes) => {
    const totalSeconds = totalMinutes * 60;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${seconds}s`;
  };

  const downloadExcel = (data) => {
    // Map the data to the desired format
    const formattedData = data.map((row) => ({
      Date: row.date,
      "First Ignition On": row.firstIgnitionTrueFromStart
        ? dayjs(row.firstIgnitionTrueFromStart.deviceTime).format(
            "YYYY-MM-DD HH:mm:ss"
          )
        : "N/A",
      "Last Ignition Off": row.firstIgnitionTrueFromEnd
        ? dayjs(row.firstIgnitionTrueFromEnd.deviceTime).format(
            "YYYY-MM-DD HH:mm:ss"
          )
        : "N/A",
      Duration: row.duration !== null ? formatDuration(row.duration) : "N/A",
      "Total Distance Covered(km)": Math.min(
        row.totalDistance / 1000,
        1011
      ).toFixed(2),
    }));

    // Create a new worksheet
    const ws = XLSX.utils.json_to_sheet(formattedData);

    // Define header cell style
    const headerCellStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } }, // White font color and bold
      fill: { fgColor: { rgb: "008000" } }, // Green background color
      alignment: { horizontal: "center" }, // Center align text
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
      },
    };

    // Apply styles to header cells
    for (let cell in ws) {
      if (cell[0] === "!") continue; // Skip metadata
      if (cell[1] === "1") {
        // Assuming the first row is the header
        ws[cell].s = headerCellStyle;
      }
    }

    // Adjust column width based on header and data
    const columnWidths = [
      {
        wch:
          Math.max(
            ...formattedData.map((item) => item.Date.length),
            "Date".length
          ) + 2,
      }, // Add a little extra space
      {
        wch:
          Math.max(
            ...formattedData.map((item) => item["First Ignition On"].length),
            "First Ignition On".length
          ) + 2,
      },
      {
        wch:
          Math.max(
            ...formattedData.map((item) => item["Last Ignition Off"].length),
            "Last Ignition Off".length
          ) + 2,
      },
      {
        wch:
          Math.max(
            ...formattedData.map((item) => item.Duration.length),
            "Duration".length
          ) + 2,
      },
      {
        wch:
          Math.max(
            ...formattedData.map(
              (item) => item["Total Distance Covered(km)"].length
            ),
            "Total Distance Covered(km)".length
          ) + 2,
      },
    ];

    // Set the column widths
    ws["!cols"] = columnWidths;

    // Create a new workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Day Report");

    // Write the Excel file
    XLSX.writeFile(wb, "Day_Report.xlsx");
  };

  // Function to download report as PDF
  // Function to download report as PDF

  const downloadPDF = (data) => {
    // Create a new jsPDF instance
    const doc = new jsPDF();

    // Set title
    doc.setFontSize(15);
    doc.text("Day Report", 14, 12);

    // Define table headers
    const headers = [
      "Date",
      "Start Time",
      "End Time",
      "Duration",
      "Total Distance",
    ];

    // Prepare data for the table
    const rows = data.map((row) => [
      String(row.date || "N/A"),
      row.firstIgnitionTrueFromStart
        ? dayjs(row.firstIgnitionTrueFromStart.deviceTime).format(
            "YYYY-MM-DD HH:mm:ss"
          )
        : "N/A",
      row.firstIgnitionTrueFromEnd
        ? dayjs(row.firstIgnitionTrueFromEnd.deviceTime).format(
            "YYYY-MM-DD HH:mm:ss"
          )
        : "N/A",
      row.duration !== null ? formatDuration(row.duration) : "N/A",
      Math.min(row.totalDistance / 1000, 1011).toFixed(2),
    ]);

    // Use autoTable to add a table with borders
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 27, // Start below the title
      columnStyles: {
        0: { cellWidth: 30 }, // Date
        1: { cellWidth: 38 }, // Start Time
        2: { cellWidth: 40 }, // End Time
        3: { cellWidth: 37 }, // Duration
        4: { cellWidth: 34 }, // Total Distance
      },
      styles: {
        fontSize: 10,
        cellPadding: 2,
        overflow: "linebreak", // Handle overflow in cells
        valign: "middle", // Vertical alignment
        lineWidth: 0.1, // Border line width
        lineColor: [0, 0, 0], // Border color (black)
        textColor: [0, 0, 0], // Border color (black)
      },
      headStyles: {
        fillColor: [200, 200, 200], // Header background color
        textColor: [0, 0, 0], // Header text color
        fontStyle: "bold", // Make header text bold
      },
      margin: { top: 10 }, // Margin around the table
    });

    // Save the PDF
    doc.save("Day_Report.pdf");
  };

  return (
    <PageLayout
      menu={<ReportsMenu />}
      breadcrumbs={["reportTitle", "reportCombined"]}
    >
      <div className={classes.container}>
        <div className={classes.containerMain}>
          <h2 style={{ paddingLeft: "30px", display: "inline-block" }}>
            Day Report
          </h2>

          {/* Search Bar */}
          <div className={classes.header}>
            <TextField
              select
              label="Select Device"
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              fullWidth
              margin="normal"
            >
              {devices.map((device) => (
                <MenuItem key={device.id} value={device.id}>
                  {device.name}
                </MenuItem>
              ))}
            </TextField>

            {/* Date Range Pickers */}
            <TextField
              label="From Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={dateRange.from}
              onChange={(e) =>
                setDateRange({ ...dateRange, from: e.target.value })
              }
              fullWidth
              margin="normal"
            />
            <TextField
              label="To Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={dateRange.to}
              onChange={(e) =>
                setDateRange({ ...dateRange, to: e.target.value })
              }
              fullWidth
              margin="normal"
            />

            {/* Fetch Report Button */}
            <Button
              onClick={fetchReport}
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} style={{ marginRight: 8 }} />
                  Fetching...
                </>
              ) : (
                "Fetch Report"
              )}
            </Button>
          </div>
          {/* Download Buttons */}
          <div style={{ marginTop: 20 }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => downloadExcel(reportData)}
              style={{ marginRight: 10 }}
            >
              Download Excel
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => downloadPDF(reportData)}
            >
              Download PDF
            </Button>
          </div>

          {/* Report Table */}
          {reportData.length > 0 ? (
            <Paper style={{ marginTop: 20 }}>
              <div>
                {loading ? (
                  <CircularProgress />
                ) : (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>First Ignition On</TableCell>
                          <TableCell>Last Ignition Off</TableCell>
                          <TableCell>Duration (minutes)</TableCell>
                          <TableCell>Total Distance Covered (km)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reportData.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>{row.date}</TableCell>

                            {/* Display deviceTime for first ignition or N/A if null */}
                            <TableCell>
                              {row.firstIgnitionTrueFromStart
                                ? dayjs(
                                    row.firstIgnitionTrueFromStart.deviceTime
                                  ).format("YYYY-MM-DD HH:mm:ss")
                                : "N/A"}
                            </TableCell>

                            {/* Display deviceTime for last ignition or N/A if null */}
                            <TableCell>
                              {row.firstIgnitionTrueFromEnd
                                ? dayjs(
                                    row.firstIgnitionTrueFromEnd.deviceTime
                                  ).format("YYYY-MM-DD HH:mm:ss")
                                : "N/A"}
                            </TableCell>

                            {/* Display duration or N/A if no valid data */}
                            <TableCell>
                              {row.duration !== null
                                ? formatDuration(row.duration)
                                : "N/A"}
                            </TableCell>

                            {/* Display total distance */}
                            <TableCell>
                              {Math.min(row.totalDistance / 1000, 1011).toFixed(
                                2
                              )}{" "}
                              km
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </div>
            </Paper>
          ) : null}
        </div>
      </div>
    </PageLayout>
  );
};

export default DayReport;
