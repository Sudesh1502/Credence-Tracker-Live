import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  TextField,
  InputAdornment,
  Box,
  Fab,
  Menu,
  MenuItem as MuiMenuItem,
} from "@mui/material";
import Search from "@mui/icons-material/Search";
import Settings from "@mui/icons-material/Settings";
import GetApp from "@mui/icons-material/GetApp";
import {
  formatDistance,
  formatSpeed,
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
import usePersistedState from "../common/util/usePersistedState";
import ColumnSelect from "./components/ColumnSelect";
import { useCatch } from "../reactHelper";
import useReportStyles from "./common/useReportStyles";
import TableShimmer from "../common/components/TableShimmer";
import scheduleReport from "./common/scheduleReport";

const columnsArray = [
  ["startTime", "reportStartDate"],
  ["distance", "sharedDistance"],
  ["startOdometer", "reportStartOdometer"],
  ["endOdometer", "reportEndOdometer"],
  ["averageSpeed", "reportAverageSpeed"],
  ["maxSpeed", "reportMaximumSpeed"],
  ["engineHours", "reportEngineHours"],
  ["spentFuel", "reportSpentFuel"],
];
const columnsMap = new Map(columnsArray);

const SummaryReportPage = () => {
  const navigate = useNavigate();
  const classes = useReportStyles();
  const t = useTranslation();

  const devices = useSelector((state) => state.devices.items);

  const distanceUnit = useAttributePreference("distanceUnit");
  const speedUnit = useAttributePreference("speedUnit");
  const volumeUnit = useAttributePreference("volumeUnit");
  const hours12 = usePreference("twelveHourFormat");

  const [columns, setColumns] = usePersistedState("summaryColumns", [
    "startTime",
    "distance",
    "averageSpeed",
  ]);
  const [daily, setDaily] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);

  const handleSettingsClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDownload = () => {
    handleSubmit({ deviceIds: [], groupIds: [], from: "", to: "", type: "export" });
    handleClose();
  };

  const handleSubmit = useCatch(
    async ({ deviceIds, groupIds, from, to, type }) => {
      const query = new URLSearchParams({ from, to, daily });
      deviceIds.forEach((deviceId) => query.append("deviceId", deviceId));
      groupIds.forEach((groupId) => query.append("groupId", groupId));
      if (type === "export") {
        window.location.assign(`/api/reports/summary/xlsx?${query.toString()}`);
      } else if (type === "mail") {
        const response = await fetch(
          `/api/reports/summary/mail?${query.toString()}`
        );
        if (!response.ok) {
          throw Error(await response.text());
        }
      } else {
        setLoading(true);
        try {
          const response = await fetch(
            `/api/reports/summary?${query.toString()}`,
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
    }
  );

  const handleSchedule = useCatch(async (deviceIds, groupIds, report) => {
    report.type = "summary";
    report.attributes.daily = daily;
    const error = await scheduleReport(deviceIds, groupIds, report);
    if (error) {
      throw Error(error);
    } else {
      navigate("/reports/scheduled");
    }
  });

  const formatValue = (item, key) => {
    switch (key) {
      case "deviceId":
        return devices[item[key]].name;
      case "startTime":
        return formatTime(item[key], "date", hours12);
      case "startOdometer":
      case "endOdometer":
      case "distance":
        return formatDistance(item[key], distanceUnit, t);
      case "averageSpeed":
      case "maxSpeed":
        return formatSpeed(item[key], speedUnit, t);
      case "engineHours":
        return formatNumericHours(item[key], t);
      case "spentFuel":
        return formatVolume(item[key], volumeUnit, t);
      default:
        return item[key];
    }
  };

  return (
    <PageLayout
      menu={<ReportsMenu />}
      breadcrumbs={["reportTitle", "reportSummary"]}
    >
      <div className={classes.header}>
        {/* Heading and Search Bar aligned in one line */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 30px",
          }}
        >
          <h2>Summary</h2>

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

        <ReportFilter
          handleSubmit={handleSubmit}
          handleSchedule={handleSchedule}
          multiDevice
          includeGroups
        >
          <div className={classes.filterItem}>
            <FormControl fullWidth>
              <InputLabel>{t("sharedType")}</InputLabel>
              <Select
                label={t("sharedType")}
                value={daily}
                onChange={(e) => setDaily(e.target.value)}
              >
                <MenuItem value={false}>{t("reportSummary")}</MenuItem>
                <MenuItem value>{t("reportDaily")}</MenuItem>
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
              <TableRow key={`${item.deviceId}_${Date.parse(item.startTime)}`}>
                <TableCell
                  sx={{
                    border: "2px solid gray",
                  }}
                >
                  {devices[item.deviceId].name}
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
            <TableShimmer columns={columns.length + 1} />
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
        <MuiMenuItem onClick={handleDownload}>
          <GetApp sx={{ marginRight: 1 }} />
          Download
        </MuiMenuItem>
      </Menu>
    </PageLayout>
  );
};

export default SummaryReportPage;
