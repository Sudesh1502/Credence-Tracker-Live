import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import MapIcon from "@mui/icons-material/Map";
import ViewListIcon from "@mui/icons-material/ViewList";
import TuneIcon from "@mui/icons-material/Tune";
import PersonIcon from "@mui/icons-material/Person";

import {
  Toolbar,
  IconButton,
  OutlinedInput,
  InputAdornment,
  Popover,
  ListItemButton,
  ListItemText,
  BottomNavigation,
  BottomNavigationAction,
  Typography,
  Menu,
  MenuItem,
  Grid,
  useMediaQuery,
} from "@mui/material";

import { makeStyles, useTheme } from "@mui/styles";
import { useRestriction } from "../common/util/permissions";
import { useDispatch, useSelector } from "react-redux";
import { nativePostMessage } from "../common/components/NativeInterface";
import { sessionActions } from "../store";

const useStyles = makeStyles((theme) => ({
  toolbar: {
    display: "flex",
    alignItems: "center",
    backgroundColor: theme.palette.background.default,
    justifyContent: "space-between",
    gap: theme.spacing(1),
    padding: theme.spacing(0, 1),
  },
  searchText: {
    color: "white",
    fontSize: "1.25rem",
    fontWeight: "bold",
    textAlign: "center",
    width: "100%", // Takes up the full width of its grid item
  },
  searchBar: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    color: theme.palette.text.primary,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    [theme.breakpoints.down("sm")]: {
      marginRight: 0,
    },
    width: "460px",
  },
}));

const currentSelection = () => {
  if (location.pathname === `/settings/user/${user.id}`) {
    return "account";
  }
};

const MainToolbar = ({
  filteredDevices,
  devicesOpen,
  setDevicesOpen,
  keyword,
  setKeyword,
  filter,
  setFilter,
  filterSort,
  setFilterSort,
  filterMap,
  setFilterMap,
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const navigate = useNavigate();

  const toolbarRef = useRef();
  const inputRef = useRef();
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [devicesAnchorEl, setDevicesAnchorEl] = useState(null);
  const [accountAnchorEl, setAccountAnchorEl] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleSearchIconClick = () => {
    setIsSearching((prev) => !prev);
  };

  const handleAccountClick = (event) => {
    setAccountAnchorEl(event.currentTarget);
  };

  const handleAccountClose = () => {
    setAccountAnchorEl(null);
  };
  const readonly = useRestriction("readonly");
  const [anchorEl, setAnchorEl] = useState(null);
  const user = useSelector((state) => state.session.user);
  const dispatch = useDispatch();

  // const handleAccount = () => {
  //   setAnchorEl(null);
  //   navigate(`/settings/user/${user.id}`);
  // };

  const handleLogout = async () => {
    setAnchorEl(null);

    // const notificationToken = window.localStorage.getItem("notificationToken");
    // if (notificationToken && !user.readonly) {
    //   window.localStorage.removeItem("notificationToken");
    //   const tokens = user.attributes.notificationTokens?.split(",") || [];
    //   if (tokens.includes(notificationToken)) {
    //     const updatedUser = {
    //       ...user,
    //       attributes: {
    //         ...user.attributes,
    //         notificationTokens:
    //           tokens.length > 1
    //             ? tokens.filter((it) => it !== notificationToken).join(",")
    //             : undefined,
    //       },
    //     };
    //     await fetch(`/api/users/${user.id}`, {
    //       method: "PUT",
    //       headers: { "Content-Type": "application/json" },
    //       body: JSON.stringify(updatedUser),
    //     });
    //   }
    // }

    await fetch("/api/session", { method: "DELETE" });
    nativePostMessage("logout");
    navigate("/login");
    dispatch(sessionActions.updateUser(null));
  };

  const currentSelection = () => {
    if (location.pathname === `/settings/user/${user.id}`) {
      return "account";
    }

    return null;
  };

  return (
    <Toolbar
      ref={toolbarRef}
      className={`${classes.toolbar} nav-item`}
      value={currentSelection()}
    >
      <Grid container alignItems="center" justifyContent="space-between">
        <Grid item>
          <IconButton edge="start" onClick={() => setDevicesOpen(!devicesOpen)}>
            {devicesOpen ? <MapIcon /> : <ViewListIcon />}
          </IconButton>
        </Grid>

        <Grid item xs>
          {isSearching ? (
            <OutlinedInput
              ref={inputRef}
              placeholder="Search devices"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onBlur={() => setDevicesAnchorEl(null)}
              className={classes.searchBar}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    edge="end"
                    onClick={() => setFilterAnchorEl(inputRef.current)}
                  >
                    <TuneIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              }
              size="small"
              fullWidth
            />
          ) : (
            <Grid container justifyContent="center">
              <span className={classes.searchText}>DASHBOARD</span>
            </Grid>
          )}
        </Grid>

        <Grid item>
          <IconButton edge="end" onClick={handleSearchIconClick}>
            <SearchIcon style={{ color: "white" }} />
          </IconButton>
        </Grid>

        {/* Account icon  */}
        <Grid item>
          <IconButton edge="end" onClick={handleAccountClick}>
            <PersonIcon style={{ color: "white" }} />
          </IconButton>
        </Grid>
      </Grid>

      {/* Account Popover */}
      <Popover
        open={Boolean(accountAnchorEl)}
        anchorEl={accountAnchorEl}
        onClose={handleAccountClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        {/* Person Icon -> Account  */}
        {/* <ListItemButton
          onClick={() => {
            navigate(`/settings/user/${user.id}`);
          }}
        ></ListItemButton> */}
        <ListItemButton onClick={() => handleLogout()}>
          <ListItemText primary={user?.email} style={{ color: "white" }} />
        </ListItemButton>
        <ListItemButton onClick={() => handleLogout()}>
          <ListItemText primary="Logout" style={{ color: "red" }} />
        </ListItemButton>
      </Popover>
    </Toolbar>
  );
};

export default MainToolbar;
