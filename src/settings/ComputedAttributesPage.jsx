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
import SearchIcon from "@mui/icons-material/Search";
import { useEffectAsync } from "../reactHelper";
import { useTranslation } from "../common/components/LocalizationProvider";
import { useAdministrator } from "../common/util/permissions";
import PageLayout from "../common/components/PageLayout";
import SettingsMenu from "./components/SettingsMenu";
import CollectionFab from "./components/CollectionFab";
import CollectionActions from "./components/CollectionActions";
import TableShimmer from "../common/components/TableShimmer";
import SearchHeader, { filterByKeyword } from "./components/SearchHeader";
import useSettingsStyles from "./common/useSettingsStyles";

const ComputedAttributesPage = () => {
  const classes = useSettingsStyles();
  const t = useTranslation();

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false); // State to control search bar visibility
  const administrator = useAdministrator();

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/attributes/computed");
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
      breadcrumbs={["settingsTitle", "sharedComputedAttributes"]}
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
          Computed Attributes
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
              {t("sharedAttribute")}
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
              {t("sharedExpression")}
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
            {administrator && (
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
                  {item.attribute}
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
                  {item.expression}
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
                  {item.type}
                </TableCell>
                {administrator && (
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
                      editPath="/settings/attribute"
                      endpoint="attributes/computed"
                      setTimestamp={setTimestamp}
                    />
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableShimmer
              columns={administrator ? 5 : 4}
              endAction={administrator}
            />
          )}
        </TableBody>
      </Table>
      <CollectionFab editPath="/settings/attribute" disabled={!administrator} />
    </PageLayout>
  );
};

export default ComputedAttributesPage;
