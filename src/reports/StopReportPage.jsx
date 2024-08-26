import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Box,
  Fab,
  Menu,
  MenuItem,
} from "@mui/material";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import LocationSearchingIcon from "@mui/icons-material/LocationSearching";
import Search from "@mui/icons-material/Search";
import Settings from "@mui/icons-material/Settings";
import GetApp from "@mui/icons-material/GetApp";
import {
  formatDistance,
  formatVolume,
  formatTime,
  formatNumericHours,
} from "../common/util/formatter";
import ReportFilter from "./components/ReportFilter";
import {
  useAttributePreference,
  usePreference,
} from "../common/util/preferences";
import { useTranslation } from "../common/components/LocalizationProvider";
import PageLayout from "../common/components/PageLayout";
import ReportsMenu from "./components/ReportsMenu";
import ColumnSelect from "./components/ColumnSelect";
import usePersistedState from "../common/util/usePersistedState";
import { useCatch } from "../reactHelper";
import useReportStyles from "./common/useReportStyles";
import MapPositions from "../map/MapPositions";
import MapView from "../map/core/MapView";
import MapCamera from "../map/MapCamera";
import AddressValue from "../common/components/AddressValue";
import TableShimmer from "../common/components/TableShimmer";
import MapGeofence from "../map/MapGeofence";
import scheduleReport from "./common/scheduleReport";

const columnsArray = [
  ["startTime", "reportStartTime"],
  ["startOdometer", "positionOdometer"],
  ["address", "positionAddress"],
  ["endTime", "reportEndTime"],
  ["duration", "reportDuration"],
  ["engineHours", "reportEngineHours"],
  ["spentFuel", "reportSpentFuel"],
];
const columnsMap = new Map(columnsArray);

const StopReportPage = () => {
  const navigate = useNavigate();
  const classes = useReportStyles();
  const t = useTranslation();

  const distanceUnit = useAttributePreference("distanceUnit");
  const volumeUnit = useAttributePreference("volumeUnit");
  const hours12 = usePreference("twelveHourFormat");

  const [columns, setColumns] = usePersistedState("stopColumns", [
    "startTime",
    "endTime",
    "startOdometer",
    "address",
  ]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);

  const handleSubmit = useCatch(async ({ deviceId, from, to, type }) => {
    const query = new URLSearchParams({ deviceId, from, to });
    if (type === "export") {
      window.location.assign(`/api/reports/stops/xlsx?${query.toString()}`);
    } else if (type === "mail") {
      const response = await fetch(
        `/api/reports/stops/mail?${query.toString()}`
      );
      if (!response.ok) {
        throw Error(await response.text());
      }
    } else {
      setLoading(true);
      try {
        const response = await fetch(`/api/reports/stops?${query.toString()}`, {
          headers: { Accept: "application/json" },
        });
        if (response.ok) {
          setItems(await response.json());
        } else {
          throw Error(await response.text());
        }
      } finally {
        setLoading(false);
      }
    }
  });

  const handleSchedule = useCatch(async (deviceIds, groupIds, report) => {
    report.type = "stops";
    const error = await scheduleReport(deviceIds, groupIds, report);
    if (error) {
      throw Error(error);
    } else {
      navigate("/reports/scheduled");
    }
  });

  const formatValue = (item, key) => {
    switch (key) {
      case "startTime":
      case "endTime":
        return formatTime(item[key], "minutes", hours12);
      case "startOdometer":
        return formatDistance(item[key], distanceUnit, t);
      case "duration":
        return formatNumericHours(item[key], t);
      case "engineHours":
        return formatNumericHours(item[key], t);
      case "spentFuel":
        return formatVolume(item[key], volumeUnit, t);
      case "address":
        return (
          <AddressValue
            latitude={item.latitude}
            longitude={item.longitude}
            originalAddress={item[key]}
          />
        );
      default:
        return item[key];
    }
  };

  const handleSettingsClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDownload = () => {
    // Implement your download logic here
    handleClose();
  };

  return (
    <PageLayout
      menu={<ReportsMenu />}
      breadcrumbs={["reportTitle", "reportStops"]}
    >
      <div className={classes.container}>
        {/* Heading and Search Bar in one line */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingLeft: "30px",
            paddingRight: "30px",
            paddingTop: "30px",
          }}
        >
          {/* Add Heading Here */}
          <h2 style={{ margin: 0 }}>Stop</h2>

          {/* Search Bar */}
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ minWidth: "300px" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {selectedItem && (
          <div className={classes.containerMap}>
            <MapView>
              <MapGeofence />
              <MapPositions
                positions={[
                  {
                    deviceId: selectedItem.deviceId,
                    fixTime: selectedItem.startTime,
                    latitude: selectedItem.latitude,
                    longitude: selectedItem.longitude,
                  },
                ]}
                titleField="fixTime"
              />
            </MapView>
            <MapCamera
              latitude={selectedItem.latitude}
              longitude={selectedItem.longitude}
            />
          </div>
        )}
        <div className={classes.containerMain}>
          <div className={classes.header}>
            <ReportFilter
              handleSubmit={handleSubmit}
              handleSchedule={handleSchedule}
            >
              <ColumnSelect
                columns={columns}
                setColumns={setColumns}
                columnsArray={columnsArray}
              />
            </ReportFilter>
          </div>
          <Table
            sx={{
              borderCollapse: "collapse",
              border: "2px solid gray",
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    border: "2px solid gray",
                    background: "#d3d3d3",
                    color: "black",
                  }}
                  className={classes.columnAction}
                />
                {columns.map((key) => (
                  <TableCell
                    sx={{
                      border: "2px solid gray",
                      background: "#d3d3d3",
                      color: "black",
                    }}
                    key={key}
                  >
                    {t(columnsMap.get(key))}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading ? (
                items.map((item) => (
                  <TableRow key={item.positionId}>
                    <TableCell
                      sx={{
                        border: "2px solid gray",
                      }}
                      className={classes.columnAction}
                      padding="none"
                    >
                      {selectedItem === item ? (
                        <IconButton
                          size="small"
                          onClick={() => setSelectedItem(null)}
                        >
                          <GpsFixedIcon fontSize="small" />
                        </IconButton>
                      ) : (
                        <IconButton
                          size="small"
                          onClick={() => setSelectedItem(item)}
                        >
                          <LocationSearchingIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                    {columns.map((key) => (
                      <TableCell
                        sx={{
                          border: "2px solid gray",
                        }}
                        key={key}
                      >
                        {formatValue(item, key)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableShimmer columns={columns.length + 1} startAction />
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Settings Button */}
      <Fab
        color="primary"
        aria-label="settings"
        sx={{ position: "fixed", bottom: 16, right: 16 }}
        onClick={handleSettingsClick}
      >
        <Settings />
      </Fab>

      {/* Settings Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleDownload}>
          <GetApp sx={{ marginRight: 1 }} />
          Download
        </MenuItem>
      </Menu>
    </PageLayout>
  );
};

export default StopReportPage;
