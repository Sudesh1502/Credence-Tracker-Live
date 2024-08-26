import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Box,
  Fab,
  Menu,
  MenuItem,
} from "@mui/material";
import { Search, Settings, GetApp } from "@mui/icons-material";
import ReportFilter from "./components/ReportFilter";
import { useTranslation } from "../common/components/LocalizationProvider";
import PageLayout from "../common/components/PageLayout";
import ReportsMenu from "./components/ReportsMenu";
import { useCatch } from "../reactHelper";
import MapView from "../map/core/MapView";
import MapRoutePath from "../map/MapRoutePath";
import useReportStyles from "./common/useReportStyles";
import TableShimmer from "../common/components/TableShimmer";
import MapCamera from "../map/MapCamera";
import MapGeofence from "../map/MapGeofence";
import { formatTime } from "../common/util/formatter";
import { usePreference } from "../common/util/preferences";
import { prefixString } from "../common/util/stringUtils";
import MapMarkers from "../map/MapMarkers";
import { useParams } from "react-router-dom";
import { InputAdornment } from "@mui/material";

const CombinedReportPage = () => {
  const classes = useReportStyles();
  const t = useTranslation();

  const devices = useSelector((state) => state.devices.items);

  const hours12 = usePreference("twelveHourFormat");

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [zoomCoordinates, setZoomCoordinates] = useState(null);

  const [anchorEl, setAnchorEl] = useState(null);

  const createMarkers = () =>
    items.flatMap((item) =>
      item.events
        .map((event) => item.positions.find((p) => event.positionId === p.id))
        .filter((position) => position != null)
        .map((position) => ({
          latitude: position.latitude,
          longitude: position.longitude,
        }))
    );

  const handleDeviceTypeClick = (item) => {
    // Set the coordinates to zoom to the first position in the item's route
    if (item.route && item.route.length > 0) {
      setZoomCoordinates(item.route[0]);
    }
  };

  const handleSubmit = useCatch(async ({ deviceIds, groupIds, from, to }) => {
    const query = new URLSearchParams({ from, to });
    deviceIds.forEach((deviceId) => query.append("deviceId", deviceId));
    groupIds.forEach((groupId) => query.append("groupId", groupId));
    setLoading(true);
    try {
      const response = await fetch(`/api/reports/combined?${query.toString()}`);
      if (response.ok) {
        setItems(await response.json());
      } else {
        throw Error(await response.text());
      }
    } finally {
      setLoading(false);
    }
  });

  const { vehicleId } = useParams();

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
      breadcrumbs={["reportTitle", "reportCombined"]}
    >
      <div className={classes.container}>
        {Boolean(items.length) && (
          <div className={classes.containerMap}>
            <MapView>
              <MapGeofence />
              {items.map((item) => (
                <MapRoutePath
                  key={item.deviceId}
                  name={devices[item.deviceId].name}
                  coordinates={item.route}
                />
              ))}
              <MapMarkers markers={createMarkers()} />
            </MapView>
            {zoomCoordinates && <MapCamera coordinates={[zoomCoordinates]} />}
          </div>
        )}
        <div className={classes.containerMain}>
          {/* Add Heading Here */}
          <h2 style={{ paddingLeft: "30px", display: "inline-block" }}>
            Status Report
          </h2>

          {/* Search Bar */}
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              marginLeft: "650px",
            }}
          >
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

          <div className={classes.header}>
            <ReportFilter
              handleSubmit={handleSubmit}
              vehicleId={vehicleId}
              showOnly
              multiDevice
              includeGroups
            />
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
                >
                  {t("sharedDevice")}
                </TableCell>
                <TableCell
                  sx={{
                    border: "2px solid gray",
                    background: "#d3d3d3",
                    color: "black",
                  }}
                >
                  {t("positionFixTime")}
                </TableCell>
                <TableCell
                  sx={{
                    border: "2px solid gray",
                    background: "#d3d3d3",
                    color: "black",
                    cursor: "pointer",
                  }}
                  onClick={() => handleDeviceTypeClick(item)}
                >
                  {t("sharedType")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading ? (
                items.flatMap((item) =>
                  item.events
                    .filter((event) => {
                      // Filter based on search query
                      const lowerCaseQuery = searchQuery.toLowerCase();
                      return (
                        devices[item.deviceId].name
                          .toLowerCase()
                          .includes(lowerCaseQuery) ||
                        formatTime(event.eventTime, "seconds", hours12)
                          .toLowerCase()
                          .includes(lowerCaseQuery) ||
                        t(prefixString("event", event.type))
                          .toLowerCase()
                          .includes(lowerCaseQuery)
                      );
                    })
                    .map((event, index) => (
                      <TableRow key={event.id}>
                        <TableCell
                          sx={{
                            border: "2px solid gray",
                          }}
                        >
                          {index ? "" : devices[item.deviceId].name}
                        </TableCell>
                        <TableCell
                          sx={{
                            border: "2px solid gray",
                          }}
                        >
                          {formatTime(event.eventTime, "seconds", hours12)}
                        </TableCell>
                        <TableCell
                          sx={{
                            border: "2px solid gray",
                            cursor: "pointer",
                          }}
                          onClick={() => handleDeviceTypeClick(item)}
                        >
                          {t(prefixString("event", event.type))}
                        </TableCell>
                      </TableRow>
                    ))
                )
              ) : (
                <TableShimmer columns={3} />
              )}
            </TableBody>
          </Table>

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
        </div>
      </div>
    </PageLayout>
  );
};

export default CombinedReportPage;
