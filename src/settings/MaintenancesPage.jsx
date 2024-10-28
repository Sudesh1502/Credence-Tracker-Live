import React, { useState } from "react";
import dayjs from "dayjs";
import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  IconButton,
  TextField,
  InputAdornment,
} from "@mui/material";
import { useEffectAsync } from "../reactHelper";
import usePositionAttributes from "../common/attributes/usePositionAttributes";
import { formatDistance, formatSpeed } from "../common/util/formatter";
import { useAttributePreference } from "../common/util/preferences";
import { useTranslation } from "../common/components/LocalizationProvider";
import PageLayout from "../common/components/PageLayout";
import SettingsMenu from "./components/SettingsMenu";
import CollectionFab from "./components/CollectionFab";
import CollectionActions from "./components/CollectionActions";
import TableShimmer from "../common/components/TableShimmer";
import SearchHeader, { filterByKeyword } from "./components/SearchHeader";
import useSettingsStyles from "./common/useSettingsStyles";
import SearchIcon from "@mui/icons-material/Search";

const MaintenacesPage = () => {
  const classes = useSettingsStyles();
  const t = useTranslation();

  const positionAttributes = usePositionAttributes(t);

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false); // State to control search bar visibility
  const speedUnit = useAttributePreference("speedUnit");
  const distanceUnit = useAttributePreference("distanceUnit");

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/maintenance");
      if (response.ok) {
        setItems(await response.json());
      } else {
        throw Error(await response.text());
      }
    } finally {
      setLoading(false);
    }
  }, [timestamp]);

  const convertAttribute = (key, start, value) => {
    const attribute = positionAttributes[key];
    if (key.endsWith("Time")) {
      if (start) {
        return dayjs(value).locale("en").format("YYYY-MM-DD");
      }
      return `${value / 86400000} ${t("sharedDays")}`;
    }
    if (attribute && attribute.dataType) {
      switch (attribute.dataType) {
        case "speed":
          return formatSpeed(value, speedUnit, t);
        case "distance":
          return formatDistance(value, distanceUnit, t);
        default:
          return value;
      }
    }

    return value;
  };

  const handleSearchChange = (event) => {
    setSearchKeyword(event.target.value);
  };

  const toggleSearch = () => {
    setShowSearch((prev) => !prev);
    if (showSearch) {
      setSearchKeyword(""); // Clear search when hiding the bar
    }
  };

  return (
    <PageLayout
      menu={<SettingsMenu />}
      breadcrumbs={["settingsTitle", "sharedMaintenance"]}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1
          style={{
            justifyContent: "center",
            textAlign: "center",
            marginLeft: "20px",
          }}
        >
          Maintenances Page
        </h1>
        {showSearch && (
          <TextField
            variant="outlined"
            placeholder="Search..."
            value={searchKeyword}
            onChange={handleSearchChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={toggleSearch}>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ marginLeft: "auto" }}
          />
        )}
        {!showSearch && (
          <IconButton onClick={toggleSearch} sx={{ marginLeft: "auto" }}>
            <SearchIcon />
          </IconButton>
        )}
      </div>
      <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />
      <Table
        sx={{
          borderCollapse: "collapse",
          border: "2px solid gray",
          paddingTop: "3px",
          paddingRight: "3px",
          width: "100%",
        }}
        className={classes.table}
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
            >
              {t("sharedName")}
            </TableCell>
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
              {t("sharedType")}
            </TableCell>
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
              {t("maintenanceStart")}
            </TableCell>
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
              {t("maintenancePeriod")}
            </TableCell>
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
            >
              Action
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {!loading ? (
            items.filter(filterByKeyword(searchKeyword)).map((item) => (
              <TableRow key={item.id}>
                <TableCell
                  sx={{
                    border: "2px solid gray",
                    paddingRight: "2px !important",
                    paddingTop: "5px !important",
                    paddingBottom: "5px !important",
                  }}
                >
                  {item.name}
                </TableCell>
                <TableCell
                  sx={{
                    border: "2px solid gray",
                    paddingRight: "0px !important",
                    paddingTop: "3px !important",
                    paddingBottom: "3px !important",
                  }}
                >
                  {item.type}
                </TableCell>
                <TableCell
                  sx={{
                    border: "2px solid gray",
                    paddingRight: "0px !important",
                    paddingTop: "3px !important",
                    paddingBottom: "3px !important",
                  }}
                >
                  {convertAttribute(item.type, true, item.start)}
                </TableCell>
                <TableCell
                  sx={{
                    border: "2px solid gray",
                    paddingRight: "0px !important",
                    paddingTop: "3px !important",
                    paddingBottom: "3px !important",
                  }}
                >
                  {convertAttribute(item.type, false, item.period)}
                </TableCell>
                <TableCell
                  sx={{
                    border: "2px solid gray",
                    paddingRight: "0px !important",
                    paddingTop: "3px !important",
                    paddingBottom: "3px !important",
                  }}
                  className={classes.columnAction}
                  padding="none"
                >
                  <CollectionActions
                    itemId={item.id}
                    editPath="/settings/maintenance"
                    endpoint="maintenance"
                    setTimestamp={setTimestamp}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableShimmer columns={5} endAction />
          )}
        </TableBody>
      </Table>
      <CollectionFab editPath="/settings/maintenance" />
    </PageLayout>
  );
};

export default MaintenacesPage;
