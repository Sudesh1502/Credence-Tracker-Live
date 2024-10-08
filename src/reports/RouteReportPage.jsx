import React, { Fragment, useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
  TextField,
  InputAdornment,
  Fab,
  Menu,
  MenuItem,
} from "@mui/material";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import LocationSearchingIcon from "@mui/icons-material/LocationSearching";
import Search from "@mui/icons-material/Search";
import Settings from "@mui/icons-material/Settings";
import GetApp from "@mui/icons-material/GetApp";
import ReportFilter from "./components/ReportFilter";
import { useTranslation } from "../common/components/LocalizationProvider";
import PageLayout from "../common/components/PageLayout";
import ReportsMenu from "./components/ReportsMenu";
import PositionValue from "../common/components/PositionValue";
import ColumnSelect from "./components/ColumnSelect";
import usePositionAttributes from "../common/attributes/usePositionAttributes";
import { useCatch } from "../reactHelper";
import MapView from "../map/core/MapView";
import MapRoutePath from "../map/MapRoutePath";
import MapRoutePoints from "../map/MapRoutePoints";
import MapPositions from "../map/MapPositions";
import useReportStyles from "./common/useReportStyles";
import TableShimmer from "../common/components/TableShimmer";
import MapCamera from "../map/MapCamera";
import MapGeofence from "../map/MapGeofence";
import scheduleReport from "./common/scheduleReport";

const RouteReportPage = () => {
  const navigate = useNavigate();
  const classes = useReportStyles();
  const t = useTranslation();

  const positionAttributes = usePositionAttributes(t);

  const devices = useSelector((state) => state.devices.items);

  const [available, setAvailable] = useState([]);
  const [columns, setColumns] = useState([
    "fixTime",
    "latitude",
    "longitude",
    "speed",
    "address",
  ]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);

  const onMapPointClick = useCallback(
    (positionId) => {
      setSelectedItem(items.find((it) => it.id === positionId));
    },
    [items, setSelectedItem]
  );

  const handleSubmit = useCatch(async ({ deviceIds, from, to, type }) => {
    const query = new URLSearchParams({ from, to });
    deviceIds.forEach((deviceId) => query.append("deviceId", deviceId));

    if (type === "export") {
      window.location.assign(`/api/reports/route/xlsx?${query.toString()}`);
    } else if (type === "mail") {
      const response = await fetch(
        `/api/reports/route/mail?${query.toString()}`
      );
      if (!response.ok) {
        throw Error(await response.text());
      }
    } else {
      setLoading(true);
      try {
        const response = await fetch(`/api/reports/route?${query.toString()}`, {
          headers: { Accept: "application/json" },
        });
        if (response.ok) {
          const data = await response.json();
          const keySet = new Set();
          const keyList = [];
          data.forEach((position) => {
            Object.keys(position).forEach((it) => keySet.add(it));
            Object.keys(position.attributes).forEach((it) => keySet.add(it));
          });
          ["id", "deviceId", "outdated", "network", "attributes"].forEach(
            (key) => keySet.delete(key)
          );
          Object.keys(positionAttributes).forEach((key) => {
            if (keySet.has(key)) {
              keyList.push(key);
              keySet.delete(key);
            }
          });
          setAvailable(
            [...keyList, ...keySet].map((key) => [
              key,
              positionAttributes[key]?.name || key,
            ])
          );
          setItems(data);
        } else {
          throw Error(await response.text());
        }
      } finally {
        setLoading(false);
      }
    }
  });

  const handleSchedule = useCatch(async (deviceIds, groupIds, report) => {
    report.type = "route";
    const error = await scheduleReport(deviceIds, groupIds, report);
    if (error) {
      throw Error(error);
    } else {
      navigate("/reports/scheduled");
    }
  });

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
      breadcrumbs={["reportTitle", "reportRoute"]}
    >
      <div className={classes.container}>
        {selectedItem && (
          <div className={classes.containerMap}>
            <MapView>
              <MapGeofence />
              {[...new Set(items.map((it) => it.deviceId))].map((deviceId) => {
                const positions = items.filter(
                  (position) => position.deviceId === deviceId
                );
                return (
                  <Fragment key={deviceId}>
                    <MapRoutePath positions={positions} />
                    <MapRoutePoints
                      positions={positions}
                      onClick={onMapPointClick}
                    />
                  </Fragment>
                );
              })}
              <MapPositions positions={[selectedItem]} titleField="fixTime" />
            </MapView>
            <MapCamera positions={items} />
          </div>
        )}
        <div className={classes.containerMain}>
          <div className={classes.header}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <h2 style={{ paddingLeft: "30px", margin: 10 }}>Custom Report</h2>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  paddingTop: "30px",
                  marginLeft: "600px",
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
            </div>
            <ReportFilter
              handleSubmit={handleSubmit}
              handleSchedule={handleSchedule}
              multiDevice
            >
              <ColumnSelect
                columns={columns}
                setColumns={setColumns}
                columnsArray={available}
                rawValues
                disabled={!items.length}
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
                    paddingTop: "3px",
                    paddingRight: "3px",
                    width: "100%",
                  }}
                  className={classes.columnAction}
                />
                <TableCell
                  sx={{
                    border: "2px solid gray",
                    background: "#d3d3d3",
                    color: "black",
                    width: "10%",
                    paddingTop: "3px !important",
                    paddingBottom: "3px !important",
                  }}
                >
                  {t("sharedDevice")}
                </TableCell>
                {columns.map((key) => (
                  <TableCell
                    key={key}
                    sx={{
                      border: "2px solid gray",
                      background: "#d3d3d3",
                      color: "black",
                      width: "10%",
                      paddingTop: "3px !important",
                      paddingBottom: "3px !important",
                    }}
                  >
                    {positionAttributes[key]?.name || key}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading ? (
                items.slice(0, 4000).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className={classes.columnAction} padding="none">
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
                    <TableCell
                      sx={{
                        border: "2px solid gray",
                        paddingRight: "2px !important",
                        paddingTop: "5px !important",
                        paddingBottom: "5px !important",
                      }}
                    >
                      {devices[item.deviceId].name}
                    </TableCell>
                    {columns.map((key) => (
                      <TableCell
                        key={key}
                        sx={{
                          border: "2px solid gray",
                          paddingRight: "0px !important",
                          paddingTop: "3px !important",
                          paddingBottom: "3px !important",
                        }}
                      >
                        <PositionValue
                          position={item}
                          property={item.hasOwnProperty(key) ? key : null}
                          attribute={item.hasOwnProperty(key) ? null : key}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableShimmer columns={columns.length + 2} startAction />
              )}
            </TableBody>
          </Table>
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
      </div>
    </PageLayout>
  );
};

export default RouteReportPage;
