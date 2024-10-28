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
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

dayjs.extend(utc);
dayjs.extend(timezone);

// Helper function for time formatting
const formatToIST = (isoString) =>
  isoString
    ? dayjs(isoString).tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm:ss A")
    : "N/A";

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

  const fetchReport = async () => {
    if (!selectedDevice || !dateRange.from || !dateRange.to) {
      alert("Please select a device and date range.");
      return;
    }

    // Convert date range from IST to UTC for backend
    const fromDate = convertISTToUTC(
      dayjs(dateRange.from).startOf("day").toISOString()
    );
    const toDate = convertISTToUTC(
      dayjs(dateRange.to).endOf("day").toISOString()
    );

    setLoading(true);
    setReportData([]);

    try {
      const response = await axios.get(
        `/api/positions?deviceId=${selectedDevice}&from=${fromDate}&to=${toDate}`
      );

      const data = response.data;
      const groupedByDay = {};
      const resultArray = [];

      // Group data by day in IST
      data?.forEach((item) => {
        const date = dayjs(item.deviceTime)
          .tz("Asia/Kolkata")
          .format("YYYY-MM-DD");
        if (!groupedByDay[date]) groupedByDay[date] = [];
        groupedByDay[date].push(item);
      });

      Object.keys(groupedByDay).forEach((day) => {
        const dayData = groupedByDay[day];

        const filteredDayData = dayData.filter((item) => {
          const itemDate = dayjs(item.deviceTime).tz("Asia/Kolkata");
          return itemDate.isSame(dayjs(day), "day");
        });

        const firstIgnitionTrueFromStart = filteredDayData.find(
          (item) => item.attributes.ignition === true
        );

        const firstIgnitionTrueFromEnd = [...filteredDayData]
          .reverse()
          .find((item) => item.attributes.ignition === true);

        const totalDistance = filteredDayData.reduce((sum, item) => {
          const distance = item.attributes.distance || 0;
          return distance > 100 ? sum : sum + distance;
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
          totalDistance,
          duration,
        });
      });

      setReportData(resultArray);
    } catch (error) {
      console.error("Error fetching report data", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const downloadExcel = (data) => {
    const formattedData = data.map((row) => ({
      Date: row.date,
      "First Ignition On": row.firstIgnitionTrueFromStart
        ? formatToIST(row.firstIgnitionTrueFromStart.deviceTime)
        : "N/A",
      "Last Ignition Off": row.firstIgnitionTrueFromEnd
        ? formatToIST(row.firstIgnitionTrueFromEnd.deviceTime)
        : "N/A",
      Duration: row.duration !== null ? formatDuration(row.duration) : "N/A",
      "Total Distance Covered(km)": Math.min(
        row.totalDistance / 1000,
        1011
      ).toFixed(2),
    }));

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Day Report");
    XLSX.writeFile(wb, "Day_Report.xlsx");
  };

  const downloadPDF = (data) => {
    const doc = new jsPDF();
    doc.setFontSize(15);
    doc.text("Day Report", 14, 12);

    const headers = [
      "Date",
      "Start Time",
      "End Time",
      "Duration",
      "Total Distance",
    ];

    const rows = data.map((row) => [
      String(row.date || "N/A"),
      row.firstIgnitionTrueFromStart
        ? formatToIST(row.firstIgnitionTrueFromStart.deviceTime)
        : "N/A",
      row.firstIgnitionTrueFromEnd
        ? formatToIST(row.firstIgnitionTrueFromEnd.deviceTime)
        : "N/A",
      row.duration !== null ? formatDuration(row.duration) : "N/A",
      Math.min(row.totalDistance / 1000, 1011).toFixed(2),
    ]);

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 27,
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 38 },
        2: { cellWidth: 40 },
        3: { cellWidth: 37 },
        4: { cellWidth: 34 },
      },
      styles: {
        fontSize: 10,
        cellPadding: 2,
        overflow: "linebreak",
        valign: "middle",
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        textColor: [0, 0, 0],
      },
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
      margin: { top: 10 },
    });

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

          <div
            className={classes.header}
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "10px",
              margin: "20px",
            }}
          >
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

            <TextField
              label="From Date"
              type="datetime-local"
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
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              value={dateRange.to}
              onChange={(e) =>
                setDateRange({ ...dateRange, to: e.target.value })
              }
              fullWidth
              margin="normal"
            />

            <Button
              onClick={fetchReport}
              variant="contained"
              color="primary"
              disabled={loading}
              fullWidth
              style={{ marginTop: "15px" }}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} style={{ marginRight: 8 }} />
                  Generating...
                </>
              ) : (
                "Generate"
              )}
            </Button>
          </div>

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

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center" }}>
              Loading...
            </div>
          ) : reportData.length > 0 ? (
            <Paper style={{ marginTop: 20 }}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Vehicle Start</TableCell>
                      <TableCell>Vehicle Stop</TableCell>
                      <TableCell>Duration (minutes)</TableCell>
                      <TableCell>Total Distance Covered (km)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>
                          {row.firstIgnitionTrueFromStart
                            ? formatToIST(
                                row.firstIgnitionTrueFromStart.deviceTime
                              )
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          {row.firstIgnitionTrueFromEnd
                            ? formatToIST(
                                row.firstIgnitionTrueFromEnd.deviceTime
                              )
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          {row.duration !== null
                            ? formatDuration(row.duration)
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          {(row.totalDistance != null
                            ? Math.min(row.totalDistance / 1000, 1011)
                            : 0
                          ).toFixed(2)}{" "}
                          km
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          ) : (
            "No data available"
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default DayReport;
