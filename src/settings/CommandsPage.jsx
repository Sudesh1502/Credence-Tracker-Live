import React, { useState } from "react";
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
import { useTranslation } from "../common/components/LocalizationProvider";
import { formatBoolean } from "../common/util/formatter";
import { prefixString } from "../common/util/stringUtils";
import PageLayout from "../common/components/PageLayout";
import SettingsMenu from "./components/SettingsMenu";
import CollectionFab from "./components/CollectionFab";
import CollectionActions from "./components/CollectionActions";
import TableShimmer from "../common/components/TableShimmer";
import SearchHeader, { filterByKeyword } from "./components/SearchHeader";
import { useRestriction } from "../common/util/permissions";
import useSettingsStyles from "./common/useSettingsStyles";
import SearchIcon from "@mui/icons-material/Search";

const CommandsPage = () => {
  const classes = useSettingsStyles();
  const t = useTranslation();

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false); // State to control search bar visibility

  const limitCommands = useRestriction("limitCommands");

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/commands");
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
      breadcrumbs={["settingsTitle", "sharedSavedCommands"]}
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
          Saved Commands
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
              {t("sharedDescription")}
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
              {t("commandSendSms")}
            </TableCell>
            {!limitCommands && (
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
            )}
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
                  {item.description}
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
                  {t(prefixString("command", item.type))}
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
                  {formatBoolean(item.textChannel, t)}
                </TableCell>
                {!limitCommands && (
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
                      editPath="/settings/command"
                      endpoint="commands"
                      setTimestamp={setTimestamp}
                    />
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableShimmer columns={limitCommands ? 3 : 4} endAction />
          )}
        </TableBody>
      </Table>
      <CollectionFab editPath="/settings/command" disabled={limitCommands} />
    </PageLayout>
  );
};

export default CommandsPage;
