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

const formatTime = (isoString) =>
  isoString ? dayjs(isoString).format("HH:mm:ss") : "---";

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

    const fromDate = dayjs(dateRange.from).startOf("day").toISOString();
    const toDate = dayjs(dateRange.to).endOf("day").toISOString();

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
        const date = dayjs(item.fixTime).startOf("day").format("YYYY-MM-DD");
        if (!groupedByDay[date]) {
          groupedByDay[date] = [];
        }
        groupedByDay[date].push(item);
      });

      // Create result array
      Object.keys(groupedByDay).forEach((day) => {
        const dayData = groupedByDay[day];

        // 1. Get the date
        const date = day;

        // 2. Find the first object where ignition == true (starting from the 0th index)
        const firstIgnitionTrueFromStart = dayData.find(
          (item) => item.attributes.ignition === true
        );

        // 3. Find the first object where ignition == true (starting from the last index)
        const firstIgnitionTrueFromEnd = [...dayData]
          .reverse()
          .find((item) => item.attributes.ignition === true);

        // 4. Calculate the sum of obj.attributes.distance from 0th index to last index
        const totalDistance = dayData.reduce((sum, item) => {
            console.log("This is distance = "+JSON.stringify(item)); // Log the distance of each item
            return sum + (item.attributes.distance || 0); // Add the distance to the sum
          }, 0);

        // Calculate duration between first and last ignition (if both exist)
        let duration = null;
        if (firstIgnitionTrueFromStart && firstIgnitionTrueFromEnd) {
          duration = dayjs(firstIgnitionTrueFromEnd.deviceTime).diff(
            dayjs(firstIgnitionTrueFromStart.deviceTime),
            "minute"
          );
        }

        

        resultArray.push({
          date: date,
          firstIgnitionTrueFromStart: firstIgnitionTrueFromStart || null,
          firstIgnitionTrueFromEnd: firstIgnitionTrueFromEnd || null,
          totalDistance: totalDistance,
          duration: duration,
        });
      });

      console.log(resultArray); // Log result for reference
      setReportData(resultArray); // Store result in state
    } catch (error) {
      console.error("Error fetching report data", error);
    } finally {
      setLoading(false);
    }
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
                          <TableCell>Last Ignition On</TableCell>
                          <TableCell>Duration (minutes)</TableCell>
                          <TableCell>Total Distance Covered (km)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reportData.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>{row.date}</TableCell>

                            {/* Display fixTime for first ignition or N/A if null */}
                            <TableCell>
                              {row.firstIgnitionTrueFromStart
                                ? dayjs(
                                    row.firstIgnitionTrueFromStart.deviceTime
                                  ).format("YYYY-MM-DD HH:mm:ss")
                                : "N/A"}
                            </TableCell>

                            {/* Display fixTime for last ignition or N/A if null */}
                            <TableCell>
                              {row.firstIgnitionTrueFromEnd
                                ? dayjs(
                                    row.firstIgnitionTrueFromEnd.deviceTime
                                  ).format("YYYY-MM-DD HH:mm:ss")
                                : "N/A"}
                            </TableCell>

                            {/* Display duration or N/A if no valid data */}
                            <TableCell>
                              {row.duration !== null ? row.duration : "N/A"}
                            </TableCell>

                            {/* Display total distance */}
                            <TableCell>
                              {(row.totalDistance/1000).toFixed(2)} km
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </div>
            </Paper>
          ) : (
            <p>No data available for the selected date range.</p>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default DayReport;
