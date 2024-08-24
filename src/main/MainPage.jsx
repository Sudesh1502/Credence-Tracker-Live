import React, { useState, useCallback, useEffect } from "react";
import { Paper } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useDispatch, useSelector } from "react-redux";
import DeviceList from "./DeviceList";
import BottomMenu from "../common/components/BottomMenu";
import StatusCard from "../common/components/StatusCard";
import { devicesActions } from "../store";
import usePersistedState from "../common/util/usePersistedState";
import EventsDrawer from "./EventsDrawer";
import useFilter from "./useFilter";
import MainToolbar from "./MainToolbar";
import MainMap from "./MainMap";
import StatusBar from "./StatusBar";
import { useAttributePreference } from "../common/util/preferences";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    height: "100vh", // Full height of the viewport
  },
  sidebar: {
    pointerEvents: "none",
    display: "flex",
    flexDirection: "column",
    width: "40%", // Fixed width for the sidebar
    position: "fixed",
    left: 0,
    top: 0,
    height: "100%", // Full height, same as the viewport height
    zIndex: 1,
  },
  header: {
    pointerEvents: "auto",
    zIndex: 6,
    position: "fixed",
    top: 0,
    width: "40%", // 40% of the screen width
    backgroundColor: theme.palette.background.paper,
    height: theme.spacing(12), // Adjusted height to accommodate StatusBar
    display: "flex",
    flexDirection: "column", // Ensure children are stacked vertically
  },
  footer: {
    pointerEvents: "auto",
    zIndex: 5,
    position: "fixed",
    bottom: 0,
    width: "40%", // 40% of the screen width
    backgroundColor: theme.palette.background.paper,
    height: theme.spacing(7), // Adjust height as needed
  },
  middle: {
    flex: 1,
    display: "grid",

    paddingTop: theme.spacing(12), // Height of the header including StatusBar
    paddingBottom: theme.spacing(7), // Height of the footer
    width: "100%", // Adjust width based on sidebar visibility
  },
  mapContainer: {
    width: "100%", // Full width for the map
    height: "100%", // Full height
  },
  contentMap: {
    pointerEvents: "auto",
    width: "100%",
    height: "100%",
  },
  contentList: {
    pointerEvents: "auto",
    zIndex: 4,
    transition:
      "width 0.3s ease-in-out, visibility 0.3s ease-in-out, opacity 0.3s ease-in-out", // Added transition for width, visibility, and opacity
    opacity: (props) => (props.devicesOpen ? 1 : 0), // Handle opacity change on open/close
    visibility: (props) => (props.devicesOpen ? "visible" : "hidden"), // Handle visibility change on open/close
  },
}));

const MainPage = () => {
  const [devicesOpen, setDevicesOpen] = useState(true);
  const classes = useStyles({ devicesOpen });
  const dispatch = useDispatch();
  const theme = useTheme();

  const desktop = useMediaQuery(theme.breakpoints.up("md"));
  const mapOnSelect = useAttributePreference("mapOnSelect", true);

  const selectedDeviceId = useSelector((state) => state.devices.selectedId);
  const positions = useSelector((state) => state.session.positions);
  const [filteredPositions, setFilteredPositions] = useState([]);
  const selectedPosition = filteredPositions.find(
    (position) => selectedDeviceId && position.deviceId === selectedDeviceId
  );

  const [filteredDevices, setFilteredDevices] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = usePersistedState("filter", {
    statuses: [],
    groups: [],
  });
  const [filterSort, setFilterSort] = usePersistedState("filterSort", "");
  const [filterMap, setFilterMap] = usePersistedState("filterMap", false);

  const [eventsOpen, setEventsOpen] = useState(false);

  const onEventsClick = useCallback(() => setEventsOpen(true), [setEventsOpen]);

  useEffect(() => {
    if (!desktop && mapOnSelect && selectedDeviceId) {
      setDevicesOpen(false);
    }
  }, [desktop, mapOnSelect, selectedDeviceId]);

  useFilter(
    keyword,
    filter,
    filterSort,
    filterMap,
    positions,
    setFilteredDevices,
    setFilteredPositions
  );

  return (
    <div className={classes.root}>
      <div className={classes.sidebar}>
        <Paper square elevation={3} className={classes.header}>
          <MainToolbar
            filteredDevices={filteredDevices}
            devicesOpen={devicesOpen}
            setDevicesOpen={setDevicesOpen}
            keyword={keyword}
            setKeyword={setKeyword}
            filter={filter}
            setFilter={setFilter}
            filterSort={filterSort}
            setFilterSort={setFilterSort}
            filterMap={filterMap}
            setFilterMap={setFilterMap}
          />
          <StatusBar /> 
          
        </Paper>
        <div className={classes.middle}>
          <Paper
            square
            className={`${classes.contentList}   `}
            style={devicesOpen ? {} : { visibility: "hidden" }}
          >
            <DeviceList devices={filteredDevices} />
          </Paper>
        </div>
        {desktop && (
          <div className={`${classes.footer}`}>
            <BottomMenu />
          </div>
        )}
      </div>
      <div className={classes.mapContainer}>
        <div className={classes.contentMap}>
          <MainMap
            filteredPositions={filteredPositions}
            selectedPosition={selectedPosition}
            onEventsClick={onEventsClick}
          />
        </div>
      </div>
      <EventsDrawer open={eventsOpen} onClose={() => setEventsOpen(false)} />
      {selectedDeviceId && (
        <StatusCard
          deviceId={selectedDeviceId}
          position={selectedPosition}
          onClose={() => dispatch(devicesActions.selectId(null))}
          desktopPadding={theme.dimensions.drawerWidthDesktop}
        />
      )}
    </div>
  );
};

export default MainPage;
