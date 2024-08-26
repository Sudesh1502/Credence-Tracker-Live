import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import LinkIcon from "@mui/icons-material/Link";
import PublishIcon from "@mui/icons-material/Publish";
import SearchIcon from "@mui/icons-material/Search";
import { useEffectAsync } from "../reactHelper";
import { useTranslation } from "../common/components/LocalizationProvider";
import PageLayout from "../common/components/PageLayout";
import SettingsMenu from "./components/SettingsMenu";
import CollectionFab from "./components/CollectionFab";
import CollectionActions from "./components/CollectionActions";
import TableShimmer from "../common/components/TableShimmer";
import SearchHeader, { filterByKeyword } from "./components/SearchHeader";
import { useRestriction } from "../common/util/permissions";
import useSettingsStyles from "./common/useSettingsStyles";

const GroupsPage = () => {
  const classes = useSettingsStyles();
  const navigate = useNavigate();
  const t = useTranslation();

  const limitCommands = useRestriction("limitCommands");

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false); // State to control search bar visibility

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/groups");
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

  const actionCommand = {
    key: "command",
    title: t("deviceCommand"),
    icon: <PublishIcon fontSize="small" />,
    handler: (groupId) => navigate(`/settings/group/${groupId}/command`),
  };

  const actionConnections = {
    key: "connections",
    title: t("sharedConnections"),
    icon: <LinkIcon fontSize="small" />,
    handler: (groupId) => navigate(`/settings/group/${groupId}/connections`),
  };

  return (
    <PageLayout
      menu={<SettingsMenu />}
      breadcrumbs={["settingsTitle", "settingsGroups"]}
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
          Groups Page
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
        }}
        className={classes.table}
      >
        <TableHead sx={{ alignItems: "center" }}>
          <TableRow>
            <TableCell
              sx={{
                border: "2px solid gray",
                background: "#d3d3d3",
                color: "black",
                alignItems: "Left",
              }}
            >
              {t("sharedName")}
            </TableCell>
            <TableCell
              sx={{
                border: "2px solid gray",
                background: "#d3d3d3",
                color: "black",
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
                  }}
                >
                  {item.name}
                </TableCell>
                <TableCell
                  sx={{
                    border: "2px solid gray",
                  }}
                  className={classes.columnAction}
                  padding="none"
                >
                  <CollectionActions
                    itemId={item.id}
                    editPath="/settings/group"
                    endpoint="groups"
                    setTimestamp={setTimestamp}
                    customActions={
                      limitCommands
                        ? [actionConnections]
                        : [actionConnections, actionCommand]
                    }
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableShimmer columns={2} endAction />
          )}
        </TableBody>
      </Table>
      <CollectionFab editPath="/settings/group" />
    </PageLayout>
  );
};

export default GroupsPage;
