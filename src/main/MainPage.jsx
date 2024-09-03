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
import "./MainPages.css";
import { useEffectAsync } from "../reactHelper";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    height: "100vh",
  },
  sidebar: {
    pointerEvents: "none",
    display: "flex",
    flexDirection: "column",
    width: "40%",
    position: "fixed",
    left: 0,
    top: 0,
    height: "100%",
    zIndex: 1,
  },
  header: {
    pointerEvents: "auto",
    zIndex: 6,
    position: "fixed",
    top: 0,
    width: "40%",
    backgroundColor: theme.palette.background.paper,
    height: theme.spacing(12),
    display: "flex",
    flexDirection: "column",
  },
  footer: {
    pointerEvents: "auto",
    zIndex: 5,
    position: "fixed",
    bottom: 0,
    width: "40%",
    backgroundColor: theme.palette.background.paper,
    height: theme.spacing(7),
  },
  middle: {
    flex: 1,
    display: "grid",
    paddingTop: theme.spacing(12),
    paddingBottom: theme.spacing(7),
    width: "100%",
  },
  mapContainer: {
    width: "100%",
    height: "100%",
  },
  contentMap: {
    pointerEvents: "auto",
    width: "100%",
    height: "100%",
  },
  contentList: {
    pointerEvents: "auto",
    zIndex: 4,
    transition: "width 0.3s ease-in-out, visibility 0.3s ease-in-out, opacity 0.3s ease-in-out",
    opacity: (props) => (props.devicesOpen ? 1 : 0),
    visibility: (props) => (props.devicesOpen ? "visible" : "hidden"),
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

  const [runningArray, setRunningArray] = useState([]);
  const [stopArray, setStopArray] = useState([]);
  const [idleArray, setIdleArray] = useState([]);
  const [overspeedArray, setOverspeedArray] = useState([]);
  const [inactiveArray, setInactiveArray] = useState([]);
  const [data, setData] = useState("all");
  const [pass, setPass] = useState(filteredDevices);

   
  useEffectAsync(async () => {
    const response = await fetch('/api/devices');
    if (response.ok) {
      setFilteredDevices(await response.json());
    } else {
      throw Error(await response.text());
    }
  }, []);
  useFilter(
    keyword,
    filter,
    filterSort,
    filterMap,
    positions,
    setFilteredDevices,
    setFilteredPositions
  );

  // Update device status arrays whenever filteredDevices changes
  useEffect(() => {
    if (filteredDevices.length > 0) {
      const deviceIds = filteredDevices.map(device => device.id);
      let array = Object.values(positions);
      // console.log("positions====================",array[0])
      // console.log("filteredDevices====================",filteredDevices[0])
  
      const matchedPositions = array.filter(position => deviceIds.includes(position.deviceId));
      setRunningArray(
        matchedPositions.filter((device) => {
          const ignition = device?.attributes.ignition;
          const speed = device?.speed;
          return ignition && speed >= 2 && speed <= 60;
        })
      );

  
      setStopArray(
        matchedPositions.filter((device) => {
          const ignition = device?.attributes?.ignition;
          const speed = device?.speed;
          return !ignition && speed < 1;
        })
      );
  
      setIdleArray(
        matchedPositions.filter((device) => {
          const ignition = device?.attributes?.ignition;
          const speed = device?.speed;
          return ignition && speed < 2;
        })
      );
  
      setOverspeedArray(
        matchedPositions.filter((device) => {
          const ignition = device?.attributes?.ignition;
          const speed = device?.speed;
          return ignition && speed > 60;
        })
      );
  
      setInactiveArray(
        matchedPositions.filter((device) => {
          return !device || !device.attributes || Object.keys(device).length === 0;
        })
      );
    }
  }, [filteredDevices, positions]);

  // Update filtered devices when the selected status changes
  useEffect(() => {
    const array = getArrayByStatus(data);
    setPass(array); // Update the filtered devices to display
    console.log("Filtered devices updated: for : ",data," : ", array); // Debugging line
  }, [data]);

  const getArrayByStatus = (status) => {
    switch (status) {
      case "running":
        return runningArray;
      case "stop":
        return stopArray;
      case "idle":
        return idleArray;
      case "overspeed":
        return overspeedArray;
      case "inactive":
        return inactiveArray;
      case "all":
        return filteredDevices; // return all filtered devices if 'all' is selected
      default:
        return filteredDevices;
    }
  };

  return (
    <div className={classes.root}>
      <div className={`${classes.sidebar} middlesidebar`}>
        <Paper square elevation={3} className={`${classes.header} navbar`}>
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
          <StatusBar setData={setData} positions={positions} />
        </Paper>
        <div className={classes.middle}>
          <Paper
            square
            className={`${classes.contentList}`}
            style={devicesOpen ? {} : { visibility: "hidden" }}
          >
            <DeviceList devices={pass} />
          </Paper>
        </div>
        {desktop && (
          <div className={`${classes.footer} bottom`}>
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
