import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Link,
  IconButton,
  Box,
  TextField,
  InputAdornment,
} from "@mui/material";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import LocationSearchingIcon from "@mui/icons-material/LocationSearching";
import Search from "@mui/icons-material/Search";
import { useSelector } from "react-redux";
import { formatSpeed, formatTime } from "../common/util/formatter";
import ReportFilter from "./components/ReportFilter";
import { prefixString } from "../common/util/stringUtils";
import { useTranslation } from "../common/components/LocalizationProvider";
import PageLayout from "../common/components/PageLayout";
import ReportsMenu from "./components/ReportsMenu";
import usePersistedState from "../common/util/usePersistedState";
import ColumnSelect from "./components/ColumnSelect";
import { useCatch, useEffectAsync } from "../reactHelper";
import useReportStyles from "./common/useReportStyles";
import TableShimmer from "../common/components/TableShimmer";
import {
  useAttributePreference,
  usePreference,
} from "../common/util/preferences";
import MapView from "../map/core/MapView";
import MapGeofence from "../map/MapGeofence";
import MapPositions from "../map/MapPositions";
import MapCamera from "../map/MapCamera";
import scheduleReport from "./common/scheduleReport";

const columnsArray = [
  ["eventTime", "positionFixTime"],
  ["type", "sharedType"],
  ["geofenceId", "sharedGeofence"],
  ["maintenanceId", "sharedMaintenance"],
  ["attributes", "commandData"],
];
const columnsMap = new Map(columnsArray);

const EventReportPage = () => {
  const navigate = useNavigate();
  const classes = useReportStyles();
  const t = useTranslation();

  const devices = useSelector((state) => state.devices.items);
  const geofences = useSelector((state) => state.geofences.items);

  const speedUnit = useAttributePreference("speedUnit");
  const hours12 = usePreference("twelveHourFormat");

  const [allEventTypes, setAllEventTypes] = useState([
    ["allEvents", "eventAll"],
  ]);

  const [columns, setColumns] = usePersistedState("eventColumns", [
    "eventTime",
    "type",
    "attributes",
  ]);
  const [eventTypes, setEventTypes] = useState(["allEvents"]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [position, setPosition] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffectAsync(async () => {
    if (selectedItem) {
      const response = await fetch(
        `/api/positions?id=${selectedItem.positionId}`
      );
      if (response.ok) {
        const positions = await response.json();
        if (positions.length > 0) {
          setPosition(positions[0]);
        }
      } else {
        throw Error(await response.text());
      }
    } else {
      setPosition(null);
    }
  }, [selectedItem]);

  useEffectAsync(async () => {
    const response = await fetch("/api/notifications/types");
    if (response.ok) {
      const types = await response.json();
      setAllEventTypes([
        ...allEventTypes,
        ...types.map((it) => [it.type, prefixString("event", it.type)]),
      ]);
    } else {
      throw Error(await response.text());
    }
  }, []);

  const handleSubmit = useCatch(async ({ deviceId, from, to, type }) => {
    const query = new URLSearchParams({ deviceId, from, to });
    eventTypes.forEach((it) => query.append("type", it));
    if (type === "export") {
      window.location.assign(`/api/reports/events/xlsx?${query.toString()}`);
    } else if (type === "mail") {
      const response = await fetch(
        `/api/reports/events/mail?${query.toString()}`
      );
      if (!response.ok) {
        throw Error(await response.text());
      }
    } else {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/reports/events?${query.toString()}`,
          {
            headers: { Accept: "application/json" },
          }
        );
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
    report.type = "events";
    if (eventTypes[0] !== "allEvents") {
      report.attributes.types = eventTypes.join(",");
    }
    const error = await scheduleReport(deviceIds, groupIds, report);
    if (error) {
      throw Error(error);
    } else {
      navigate("/reports/scheduled");
    }
  });

  const formatValue = (item, key) => {
    switch (key) {
      case "eventTime":
        return formatTime(item[key], "seconds", hours12);
      case "type":
        return t(prefixString("event", item[key]));
      case "geofenceId":
        if (item[key] > 0) {
          const geofence = geofences[item[key]];
          return geofence && geofence.name;
        }
        return null;
      case "maintenanceId":
        return item[key] > 0 ? item[key] > 0 : null;
      case "attributes":
        switch (item.type) {
          case "alarm":
            return t(prefixString("alarm", item.attributes.alarm));
          case "deviceOverspeed":
            return formatSpeed(item.attributes.speed, speedUnit, t);
          case "driverChanged":
            return item.attributes.driverUniqueId;
          case "media":
            return (
              <Link
                href={`/api/media/${devices[item.deviceId]?.uniqueId}/${
                  item.attributes.file
                }`}
                target="_blank"
              >
                {item.attributes.file}
              </Link>
            );
          case "commandResult":
            return item.attributes.result;
          default:
            return "";
        }
      default:
        return item[key];
    }
  };

  return (
    <PageLayout
      menu={<ReportsMenu />}
      breadcrumbs={["reportTitle", "reportEvents"]}
    >
      <div className={classes.container}>
        {/* Heading and Search Bar in Flex Container */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 50px",
          }}
        >
          <h2 style={{ margin: 0 }}>Alert</h2>
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
              {position && (
                <MapPositions positions={[position]} titleField="fixTime" />
              )}
            </MapView>
            {position && (
              <MapCamera
                latitude={position.latitude}
                longitude={position.longitude}
              />
            )}
          </div>
        )}
        <div className={classes.containerMain}>
          <div className={classes.header}>
            <ReportFilter
              handleSubmit={handleSubmit}
              handleSchedule={handleSchedule}
            >
              <div className={classes.filterItem}>
                <FormControl fullWidth>
                  <InputLabel>{t("reportEventTypes")}</InputLabel>
                  <Select
                    label={t("reportEventTypes")}
                    value={eventTypes}
                    onChange={(event, child) => {
                      let values = event.target.value;
                      const clicked = child.props.value;
                      if (values.includes("allEvents") && values.length > 1) {
                        values = [clicked];
                      }
                      setEventTypes(values);
                    }}
                    multiple
                  >
                    {allEventTypes.map(([key, string]) => (
                      <MenuItem key={key} value={key}>
                        {t(string)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
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
              paddingTop: "3px",
              paddingRight: "3px",
              width: "100%",
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    border: "2px solid gray",
                    background: "#d3d3d3",
                    color: "black",
                    width: "10%",
                    paddingTop: "3px !important",
                    paddingBottom: "3px !important",
                  }}
                  className={classes.columnAction}
                />
                {columns.map((key) => (
                  <TableCell
                    sx={{
                      border: "2px solid gray",
                      background: "#d3d3d3",
                      color: "black",
                      paddingTop: "3px !important",
                      paddingBottom: "3px !important",
                    }}
                    key={key}
                  >
                    {t(columnsMap.get(key))}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1}>
                    <TableShimmer rows={10} />
                  </TableCell>
                </TableRow>
              ) : (
                items
                  .filter((item) => {
                    return columns.some((column) =>
                      formatValue(item, column)
                        ?.toString()
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                    );
                  })
                  .map((item) => (
                    <TableRow
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      hover
                      selected={selectedItem === item}
                      sx={{
                        "&:hover": {
                          background: "lightblue",
                          cursor: "pointer",
                        },
                      }}
                    >
                      <TableCell
                        className={classes.columnAction}
                        sx={{
                          border: "2px solid gray",
                          paddingRight: "2px !important",
                          paddingTop: "5px !important",
                          paddingBottom: "5px !important",
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            const position = {
                              latitude: item.attributes.latitude,
                              longitude: item.attributes.longitude,
                            };
                            setPosition(position);
                          }}
                        >
                          <GpsFixedIcon />
                        </IconButton>
                      </TableCell>
                      {columns.map((key) => (
                        <TableCell
                          key={key}
                          sx={{
                            border: "2px solid gray",
                            width: "10px",
                            paddingRight: "0px !important",
                            paddingTop: "3px !important",
                            paddingBottom: "3px !important",
                          }}
                        >
                          {formatValue(item, key)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </PageLayout>
  );
};

export default EventReportPage;
