import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Switch,
  TableFooter,
  FormControlLabel,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import LinkIcon from "@mui/icons-material/Link";
import SearchIcon from "@mui/icons-material/Search";
import { useCatch, useEffectAsync } from "../reactHelper";
import { formatBoolean, formatTime } from "../common/util/formatter";
import { useTranslation } from "../common/components/LocalizationProvider";
import PageLayout from "../common/components/PageLayout";
import SettingsMenu from "./components/SettingsMenu";
import CollectionFab from "./components/CollectionFab";
import CollectionActions from "./components/CollectionActions";
import TableShimmer from "../common/components/TableShimmer";
import { useManager } from "../common/util/permissions";
import SearchHeader, { filterByKeyword } from "./components/SearchHeader";
import { usePreference } from "../common/util/preferences";
import useSettingsStyles from "./common/useSettingsStyles";

const UsersPage = () => {
  const classes = useSettingsStyles();
  const navigate = useNavigate();
  const t = useTranslation();

  const manager = useManager();

  const hours12 = usePreference("twelveHourFormat");

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [temporary, setTemporary] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const handleLogin = useCatch(async (userId) => {
    const response = await fetch(`/api/session/${userId}`);
    if (response.ok) {
      window.location.replace("/");
    } else {
      throw Error(await response.text());
    }
  });

  const actionLogin = {
    key: "login",
    title: t("loginLogin"),
    icon: <LoginIcon fontSize="small" />,
    handler: handleLogin,
  };

  const actionConnections = {
    key: "connections",
    title: t("sharedConnections"),
    icon: <LinkIcon fontSize="small" />,
    handler: (userId) => navigate(`/settings/user/${userId}/connections`),
  };

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/users");
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

  return (
    <PageLayout
      menu={<SettingsMenu />}
      breadcrumbs={["settingsTitle", "settingsUsers"]}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Users Page</h1>
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
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                border: "2px solid gray",
                background: "#d3d3d3",
                color: "black",
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
            >
              {t("userEmail")}
            </TableCell>
            <TableCell
              sx={{
                border: "2px solid gray",
                background: "#d3d3d3",
                color: "black",
              }}
            >
              {t("userAdmin")}
            </TableCell>
            <TableCell
              sx={{
                border: "2px solid gray",
                background: "#d3d3d3",
                color: "black",
              }}
            >
              {t("sharedDisabled")}
            </TableCell>
            <TableCell
              sx={{
                border: "2px solid gray",
                background: "#d3d3d3",
                color: "black",
              }}
            >
              {t("userExpirationTime")}
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
            items
              .filter((u) => temporary || !u.temporary)
              .filter(filterByKeyword(searchKeyword))
              .map((item) => (
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
                  >
                    {item.email}
                  </TableCell>
                  <TableCell
                    sx={{
                      border: "2px solid gray",
                    }}
                  >
                    {formatBoolean(item.administrator, t)}
                  </TableCell>
                  <TableCell
                    sx={{
                      border: "2px solid gray",
                    }}
                  >
                    {formatBoolean(item.disabled, t)}
                  </TableCell>
                  <TableCell
                    sx={{
                      border: "2px solid gray",
                    }}
                  >
                    {formatTime(item.expirationTime, "date", hours12)}
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
                      editPath="/settings/user"
                      endpoint="users"
                      setTimestamp={setTimestamp}
                      customActions={
                        manager
                          ? [actionLogin, actionConnections]
                          : [actionConnections]
                      }
                    />
                  </TableCell>
                </TableRow>
              ))
          ) : (
            <TableShimmer columns={6} endAction />
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={6} align="right">
              <FormControlLabel
                control={
                  <Switch
                    value={temporary}
                    onChange={(e) => setTemporary(e.target.checked)}
                    size="small"
                  />
                }
                label={t("userTemporary")}
                labelPlacement="start"
              />
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <CollectionFab editPath="/settings/user" />
    </PageLayout>
  );
};

export default UsersPage;
