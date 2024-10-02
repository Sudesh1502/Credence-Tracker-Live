import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Button,
  TableFooter,
  IconButton,
  TextField,
  InputAdornment,
  Pagination,
  PaginationItem,
  Box,
} from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import SearchIcon from "@mui/icons-material/Search";
import { useEffectAsync } from "../reactHelper";
import { useTranslation } from "../common/components/LocalizationProvider";
import PageLayout from "../common/components/PageLayout";
import SettingsMenu from "./components/SettingsMenu";
import CollectionFab from "./components/CollectionFab";
import CollectionActions from "./components/CollectionActions";
import TableShimmer from "../common/components/TableShimmer";
import SearchHeader, { filterByKeyword } from "./components/SearchHeader";
import { usePreference } from "../common/util/preferences";
import { formatTime } from "../common/util/formatter";
import { useDeviceReadonly } from "../common/util/permissions";
import useSettingsStyles from "./common/useSettingsStyles";

const DevicesPage = () => {
  const classes = useSettingsStyles();
  const navigate = useNavigate();
  const t = useTranslation();

  const groups = useSelector((state) => state.groups.items);
  const hours12 = usePreference("twelveHourFormat");
  const deviceReadonly = useDeviceReadonly();

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 17; // You can change the items per page value as needed

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/devices");
      if (response.ok) {
        setItems(await response.json());
      } else {
        throw Error(await response.text());
      }
    } finally {
      setLoading(false);
    }
  }, [timestamp]);

  const handleExport = () => {
    window.location.assign("/api/reports/devices/xlsx");
  };

  const actionConnections = {
    key: "connections",
    title: t("sharedConnections"),
    icon: <LinkIcon fontSize="small" />,
    handler: (deviceId) => navigate(`/settings/device/${deviceId}/connections`),
  };

  const toggleSearch = () => {
    setShowSearch((prev) => !prev);
    if (showSearch) {
      setSearchKeyword(""); // Clear search when hiding the bar
    }
  };

  const handleSearchChange = (event) => {
    setSearchKeyword(event.target.value);
  };

  // Pagination logic
  const handlePageClick = (event, value) => {
    setCurrentPage(value); // Update current page on click
  };

  const offset = (currentPage - 1) * itemsPerPage;
  const currentItems = items
    .filter(filterByKeyword(searchKeyword)) // Apply search filter
    .slice(offset, offset + itemsPerPage); // Slice the items array based on the current page

  const pageCount = Math.ceil(
    items.filter(filterByKeyword(searchKeyword)).length / itemsPerPage
  ); // Calculate total number of pages

  return (
    <PageLayout
      menu={<SettingsMenu />}
      breadcrumbs={["settingsTitle", "deviceTitle"]}
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
          Devices Page
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
              {t("deviceIdentifier")}
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
              {t("groupParent")}
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
              {t("sharedPhone")}
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
              {t("deviceModel")}
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
              {t("deviceContact")}
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
              {t("userExpirationTime")}
            </TableCell>
            <TableCell
              sx={{
                border: "2px solid gray",
                background: "#d3d3d3",
                color: "black",
                textAlign: "center",
                width: "10%",
                paddingTop: "3px !important",
                paddingBottom: "3px !important",
              }}
              className={classes.columnAction}
              padding="none"
            >
              Action
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {!loading ? (
            currentItems.map((item) => (
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
                    paddingRight: "2px !important",
                    paddingTop: "5px !important",
                    paddingBottom: "5px !important",
                  }}
                >
                  {item.uniqueId}
                </TableCell>
                <TableCell
                  sx={{
                    border: "2px solid gray",
                    width: "10px",
                    paddingRight: "0px !important",
                    paddingTop: "3px !important",
                    paddingBottom: "3px !important",
                  }}
                >
                  {item.groupId ? groups[item.groupId]?.name : null}
                </TableCell>
                <TableCell
                  sx={{
                    border: "2px solid gray",
                    paddingRight: "2px !important",
                    paddingTop: "3px !important",
                    paddingBottom: "3px !important",
                  }}
                >
                  {item.phone}
                </TableCell>
                <TableCell
                  sx={{
                    border: "2px solid gray",
                    paddingRight: "2px !important",
                    paddingTop: "3px !important",
                    paddingBottom: "3px !important",
                  }}
                >
                  {item.model}
                </TableCell>
                <TableCell
                  sx={{
                    border: "2px solid gray",
                    paddingRight: "2px !important",
                    paddingTop: "3px !important",
                    paddingBottom: "3px !important",
                  }}
                >
                  {item.contact}
                </TableCell>
                <TableCell
                  sx={{
                    border: "2px solid gray",
                    width: "10px",
                    paddingRight: "0px !important",
                    paddingTop: "3px !important",
                    paddingBottom: "3px !important",
                  }}
                >
                  {formatTime(item.expirationTime, "date", hours12)}
                </TableCell>
                <TableCell
                  sx={{
                    border: "2px solid gray",
                    width: "10px",
                    paddingRight: "0px !important",
                    paddingTop: "3px !important",
                    paddingBottom: "3px !important",
                  }}
                  className={classes.columnAction}
                  padding="none"
                >
                  <CollectionActions
                    itemId={item.id}
                    editPath="/settings/device"
                    endpoint="devices"
                    setTimestamp={setTimestamp}
                    customActions={[actionConnections]}
                    readonly={deviceReadonly}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8}>
                <TableShimmer />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        
        <TableFooter>
        
          <TableRow>
            <TableCell colSpan={8}>
              <Pagination
                count={pageCount}
                page={currentPage}
                onChange={handlePageClick}
                renderItem={(item) => (
                  <PaginationItem
                    {...item}
                    sx={{
                      margin: "0 5px",
                    }}
                  />
                )}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={8} align="right">
              <Button onClick={handleExport} variant="text">
                {t("reportExport")}
              </Button>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <CollectionFab handleExport={handleExport} />
    </PageLayout>
  );
};

export default DevicesPage;
