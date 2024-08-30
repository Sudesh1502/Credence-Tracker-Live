import React, { useState } from "react";
import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useEffectAsync } from "../reactHelper";
import { prefixString } from "../common/util/stringUtils";
import { formatBoolean } from "../common/util/formatter";
import { useTranslation } from "../common/components/LocalizationProvider";
import PageLayout from "../common/components/PageLayout";
import SettingsMenu from "./components/SettingsMenu";
import CollectionFab from "./components/CollectionFab";
import CollectionActions from "./components/CollectionActions";
import TableShimmer from "../common/components/TableShimmer";
import SearchHeader, { filterByKeyword } from "./components/SearchHeader";
import useSettingsStyles from "./common/useSettingsStyles";

const NotificationsPage = () => {
  const classes = useSettingsStyles();
  const t = useTranslation();

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        setItems(await response.json());
      } else {
        throw Error(await response.text());
      }
    } finally {
      setLoading(false);
    }
  }, [timestamp]);

  const handleSearchChange = (event) => {
    setSearchKeyword(event.target.value);
  };

  const toggleSearch = () => {
    setShowSearch((prev) => !prev);
    if (showSearch) {
      setSearchKeyword(""); // Clear search when hiding the bar
    }
  };

  const formatList = (type, list) => {
    if (!Array.isArray(list) || list.length === 0) {
      return "N/A"; // Or some other default message if the list is empty or not an array
    }
    return list.join(", ");
  };

  return (
    <PageLayout
      menu={<SettingsMenu />}
      breadcrumbs={["settingsTitle", "sharedNotifications"]}
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
          Notification Page
        </h1>
        <div style={{ position: "relative" }}>
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
              sx={{
                marginLeft: "auto",
                transition: "width 0.9s ease-in-out",
                width: showSearch ? 300 : 0, // Adjust the width as needed
                visibility: showSearch ? "visible" : "hidden",
              }}
            />
          )}
          {!showSearch && (
            <IconButton onClick={toggleSearch} sx={{ marginLeft: "auto" }}>
              <SearchIcon />
            </IconButton>
          )}
        </div>
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
              {t("notificationType")}
            </TableCell>
            <TableCell
              sx={{
                border: "2px solid gray",
                background: "#d3d3d3",
                color: "black",
                color: "black",
                paddingTop: "3px !important",
                paddingBottom: "3px !important",
              }}
            >
              {t("notificationAlways")}
            </TableCell>
            <TableCell
              sx={{
                border: "2px solid gray",
                background: "#d3d3d3",
                color: "black",
                color: "black",
                paddingTop: "3px !important",
                paddingBottom: "3px !important",
              }}
            >
              {t("sharedAlarms")}
            </TableCell>
            <TableCell
              sx={{
                border: "2px solid gray",
                background: "#d3d3d3",
                color: "black",
                color: "black",
                paddingTop: "3px !important",
                paddingBottom: "3px !important",
              }}
            >
              {t("notificationNotificators")}
            </TableCell>
            <TableCell
              sx={{
                border: "2px solid gray",
                background: "#d3d3d3",
                color: "black",
                color: "black",
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
                    minWidth: "12rem",
                    paddingRight: "2px !important",
                    paddingTop: "5px !important",
                    paddingBottom: "5px !important",
                  }}
                >
                  {t(prefixString("event", item.type))}
                </TableCell>
                <TableCell
                  sx={{
                    border: "2px solid gray",
                    paddingRight: "2px !important",
                    paddingTop: "5px !important",
                    paddingBottom: "5px !important",
                  }}
                >
                  {formatBoolean(item.always, t)}
                </TableCell>
                <TableCell
                  sx={{
                    border: "2px solid gray",
                    paddingRight: "2px !important",
                    paddingTop: "5px !important",
                    paddingBottom: "5px !important",
                  }}
                >
                  {formatList("alarm", item.attributes?.alarms)}
                </TableCell>
                <TableCell
                  sx={{
                    border: "2px solid gray",
                    paddingRight: "2px !important",
                    paddingTop: "5px !important",
                    paddingBottom: "5px !important",
                  }}
                >
                  {formatList("notificator", item.notificators)}
                </TableCell>
                <TableCell
                  sx={{
                    border: "2px solid gray",
                    paddingRight: "2px !important",
                    paddingTop: "5px !important",
                    paddingBottom: "5px !important",
                  }}
                  className={classes.columnAction}
                  padding="none"
                >
                  <CollectionActions
                    itemId={item.id}
                    editPath="/settings/notification"
                    endpoint="notifications"
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
      <CollectionFab editPath="/settings/notification" />
    </PageLayout>
  );
};

export default NotificationsPage;
