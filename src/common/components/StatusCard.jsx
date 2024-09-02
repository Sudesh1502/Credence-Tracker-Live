import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Draggable from "react-draggable";
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  IconButton,
  Grid,
  Menu,
  MenuItem,
  CardMedia,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import CloseIcon from "@mui/icons-material/Close";
import ReplayIcon from "@mui/icons-material/Replay";
import PublishIcon from "@mui/icons-material/Publish";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PendingIcon from "@mui/icons-material/Pending";
import AccessTimeIcon from "@mui/icons-material/AccessTime"; // Device Time
import FingerprintIcon from "@mui/icons-material/Fingerprint"; // Identifier
import LocationOnIcon from "@mui/icons-material/LocationOn"; // Latitude, Longitude
import SpeedIcon from "@mui/icons-material/Speed"; // Speed
import NavigationIcon from "@mui/icons-material/Navigation"; // Course
import HeightIcon from "@mui/icons-material/Height"; // Altitude
import MyLocationIcon from "@mui/icons-material/MyLocation"; // Accuracy
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // Valid
import HomeIcon from "@mui/icons-material/Home"; // Address
import UpdateIcon from "@mui/icons-material/Update"; // Fix Time
import CloudQueueIcon from "@mui/icons-material/CloudQueue"; // Server Time
import { Divider } from "@mui/material";
import { useTranslation } from "./LocalizationProvider";
import RemoveDialog from "./RemoveDialog";
import PositionValue from "./PositionValue";
import { useDeviceReadonly } from "../util/permissions";
import usePositionAttributes from "../attributes/usePositionAttributes";
import { devicesActions } from "../../store";
import { useCatch, useCatchCallback } from "../../reactHelper";
import { useAttributePreference } from "../util/preferences";
import SettingsInputAntennaIcon from "@mui/icons-material/SettingsInputAntenna"; // Protocol
import EventNoteIcon from "@mui/icons-material/EventNote"; // Event
import AvTimerIcon from "@mui/icons-material/AvTimer"; // Odometer
import MapIcon from "@mui/icons-material/Map"; // Geofences
import PowerIcon from "@mui/icons-material/Power"; // Ignition
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar"; // Distance
import "./PopUp.css";

import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  card: {
    pointerEvents: "auto",
    // width: "69%",
    width: "56.5rem",
    height: 250,
    borderRadius: 20,
    float: "right",
    overflowY: "scroll",
    "&::-webkit-scrollbar": {
      display: "none" /* Chrome, Safari, and Opera */,
    },
    
    /* For other browsers */
    scrollbarWidth: "none" /* Firefox */,
    msOverflowStyle: "none" /* Internet Explorer 10+ */,
  },
  media: {
    height: theme.dimensions.popupImageHeight,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "flex-start",
  },
  mediaButton: {
    color: theme.palette.primary.contrastText,
    mixBlendMode: "difference",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing(1, 1, 0, 2),
  },
  content: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    maxHeight: theme.dimensions.cardContentMaxHeight,
    overflow: "auto",
  },
  delete: {
    color: theme.palette.error.main,
  },
  icon: {
    width: "25px",
    height: "25px",
    filter: "brightness(0) invert(1)",
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(6, 2fr)",
    gridTemplateRows: "repeat(1, 0fr)",
    rowGap: "0px", // Remove vertical spacing between rows
    // columnGap: theme.spacing(2), // Keep the horizontal spacing
    alignItems: "center",
    justifyItems: "start",
    height: "100%",
    // width:"1000px"
  },
  gridItem: {
    padding: theme.spacing(1),
    boxSizing: "border-box",
  },
  actions: {
    justifyContent: "space-between",
  },
  historyStatusCard: {
    display: "flex",
    gap: "2.5rem",
    marginRight: "4rem",
  },
  histortyActive: {
    display: "flex",
    alignItems: "center",
  },
  contentData: {
    paddingLeft: "28px",
  },
  historyContent: {
    padding: "6px 10px",
    marginLeft: "10px",
    backgroundColor: "#ece7e7",
    color: "#000",
    fontSize: "0.77rem",
    borderRadius: "16px",
  },
  root: ({ desktopPadding }) => ({
    pointerEvents: "none",
    position: "fixed",
    zIndex: 5,
    right: 0,
    bottom: 0,
    transform: "none",
    [theme.breakpoints.up("md")]: {
      right: theme.spacing(1),
      bottom: theme.spacing(0.5),
    },
    [theme.breakpoints.down("md")]: {
      right: theme.spacing(3),
      bottom: `calc(${theme.spacing(3)} + ${
        theme.dimensions.bottomBarHeight
      }px)`,
    },
  }),
}));

const StatusRow = ({ name, content, history, t }) => {
  const classes = useStyles();

  // Map the name to an icon component

  if (history) {
    const skipNames = new Set([
      "altitude",
      "course",
      "accuracy",
      "valid",
      "identifier",
      "longitude",
      "latitude",
      "geofences",
      "address",
      "odometer",
      "event",
      "protocol",
      "server time",
      "fix time",
    ]);

    // Check if the name should be skipped
    console.log(name);
    if (skipNames.has(name.toLowerCase())) {
      return null;
    }
  }

  const iconMap = {
    "Device Time": <AccessTimeIcon fontSize="small" />,
    Identifier: <FingerprintIcon fontSize="small" />,
    Latitude: <LocationOnIcon fontSize="small" />,
    Longitude: <LocationOnIcon fontSize="small" />,
    Speed: <SpeedIcon fontSize="small" />,
    Course: <NavigationIcon fontSize="small" />,
    // Altitude: <HeightIcon fontSize="small" />,
    Accuracy: <MyLocationIcon fontSize="small" />,
    Valid: <CheckCircleIcon fontSize="small" />,
    Address: <HomeIcon fontSize="small" />,
    "Fix Time": <UpdateIcon fontSize="small" />,
    "Server Time": <CloudQueueIcon fontSize="small" />,
    Protocol: <SettingsInputAntennaIcon fontSize="small" />, // New Protocol icon
    Event: <EventNoteIcon fontSize="small" />, // New Event icon
    Odometer: <AvTimerIcon fontSize="small" />, // New Odometer icon
    Geofences: <MapIcon fontSize="small" />, // New Geofences icon
    Ignition: <PowerIcon fontSize="small" />, // Add Ignition icon
    Distance: <DirectionsCarIcon fontSize="small" />, // Add Distance icon
  };

  return (
    <Grid
      item
      className={clsx(classes.gridItem, {
        [classes.histortyActive]: history,
      })}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        {iconMap[name]} {/* Render the appropriate icon based on the name */}
        <Typography variant="body2" style={{ marginLeft: 7 }}>
          {name}
        </Typography>
      </div>
      <Typography
        variant="body2"
        color="textSecondary"
        className={clsx(classes.contentData, {
          [classes.historyContent]: history,
        })}
        // Apply padding to shift the lower values to the right
      >
        {content}
      </Typography>
    </Grid>
  );
};

const StatusCard = ({
  deviceId,
  position,
  onClose,
  disableActions,
  desktopPadding = 0,
  history,
}) => {
  const classes = useStyles({ desktopPadding });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();
  const [item, setItem] = useState('deviceId');
  const deviceReadonly = useDeviceReadonly();

  const shareDisabled = useSelector(
    (state) => state.session.server.attributes.disableShare
  );
  const user = useSelector((state) => state.session.user);
  const device = useSelector((state) => state.devices.items[deviceId]);

  const deviceImage = device?.attributes?.deviceImage;

  const positionAttributes = usePositionAttributes(t);
  const positionItems = useAttributePreference(
    "positionItems",
    "deviceTime,address,speed,course,latitude,longitude,accuracy,valid,fixTime,serverTime,ignition,distance"
  );

  const [anchorEl, setAnchorEl] = useState(null);
  const [removing, setRemoving] = useState(false);

  const handleRemove = useCatch(async (removed) => {
    if (removed) {
      const response = await fetch("/api/devices");
      if (response.ok) {
        dispatch(devicesActions.refresh(await response.json()));
      } else {
        throw Error(await response.text());
      }
    }
    setRemoving(false);
  });

  const handleGeofence = useCatchCallback(async () => {
    const newItem = {
      name: t("sharedGeofence"),
      area: `CIRCLE (${position.latitude} ${position.longitude}, 50)`,
    };
    const response = await fetch("/api/geofences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });
    if (response.ok) {
      const item = await response.json();
      setItem(item);
      const permissionResponse = await fetch("/api/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: position.deviceId,
          geofenceId: item.id,
        }),
      });
      if (!permissionResponse.ok) {
        throw Error(await permissionResponse.text());
      }
      navigate(`/settings/geofence/${item.id}`);
    } else {
      throw Error(await response.text());
    }
  }, [navigate, position]);

  return (
    <>
      {history ? (
        <>
          <div className={classes.historyStatusCard}>
            {positionItems
              .split(",")
              .filter(
                (key) =>
                  position.hasOwnProperty(key) ||
                  position.attributes.hasOwnProperty(key)
              )
              .map((key) => (
                <StatusRow
                  key={key}
                  name={positionAttributes[key]?.name || key}
                  content={
                    <PositionValue
                      position={position}
                      property={position.hasOwnProperty(key) ? key : null}
                      attribute={position.hasOwnProperty(key) ? null : key}
                    />
                  }
                  history={history}
                  t={t}
                />
              ))}
          </div>
        </>
      ) : (
        <>
          <div className={`${classes.root} card`}>
            {device && (
              <Draggable handle={`.${classes.media}, .${classes.header} `}>
                <Card
                  elevation={3}
                  className={`${classes.card} responsive-card `}
                >
                  {deviceImage ? (
                    <CardMedia
                      className={`${classes.media} `}
                      image={`/api/media/${device.uniqueId}/${deviceImage}`}
                    >
                      <IconButton
                        size="small"
                        onClick={onClose}
                        onTouchStart={onClose}
                      >
                        <CloseIcon
                          fontSize="small"
                          className={classes.mediaButton}
                        />
                      </IconButton>
                    </CardMedia>
                  ) : (
                    <div className={classes.header}>
                      <Typography
                        variant="body2"
                        style={{ color: "#FFFFFF", fontWeight: "bold" }} // Make the header text black and bold
                      >
                        {device.name}
                      </Typography>
                      <div
                        className="responsive-header head header"
                        style={{
                          display: "flex",
                          gap: "10px",
                          marginLeft: "380px",
                          marginRight: "auto",
                        }}
                      >
                        <IconButton
                          className="nav-bar"
                          size="small"
                          onClick={() => console.log("Geofence clicked")}
                          style={{
                            fontWeight: "bold",
                            color: "#FFFFFF",
                            border: "1px solid  ",
                            borderRadius: "4px",
                            padding: "4px 8px",
                            // margin: "2px",
                            marginBottom: "10px",
                          }}
                        >
                          <Typography
                            variant="body2"
                            style={{ fontWeight: "bold" }}
                            onClick={()=>{
                              navigate(`/settings/geofence/${device.id}`)
                            }}
                          >
                            Geofence
                          </Typography>
                        </IconButton>
                        <IconButton
                          className="nav-bar"
                          size="small"
                          onClick={() => console.log("Share clicked")}
                          disabled={shareDisabled}
                          style={{
                            fontWeight: "bold",
                            border: "1px solid white",
                            color: "#FFFFFF",
                            borderRadius: "4px",
                            padding: "4px 8px",
                            marginBottom: "10px",
                          }}
                        >
                          <Typography
                            variant="body2"
                            style={{ fontWeight: "bold" }}
                            onClick={() =>
                              navigate(`/settings/device/${deviceId}/share`)
                            }
                          >
                            Share
                          </Typography>
                        </IconButton>
                        <IconButton
                          className="nav-bar"
                          size="small"
                          onClick={() => console.log("Maintenance clicked")}
                          style={{
                            fontWeight: "bold",
                            border: "1px solid white",
                            color: "#FFFFFF",
                            borderRadius: "4px",
                            padding: "4px 8px",
                            marginBottom: "10px",
                          }}
                        >
                          <Typography
                            variant="body2"
                            style={{ fontWeight: "bold" }}
                            onClick={()=>{
                              navigate("settings/maintenances")
                            }}
                          >
                            Maintenance
                          </Typography>
                        </IconButton>
                        <IconButton
                          className="nav-bar"
                          size="small"
                          onClick={() => console.log("Wallet clicked")}
                          style={{
                            fontWeight: "bold",
                            border: "1px solid white",
                            color: "#FFFFFF",
                            borderRadius: "4px",
                            padding: "4px 8px",
                            marginBottom: "10px",
                          }}
                        >
                          <Typography
                            className="nav-bar"
                            variant="body2"
                            style={{ fontWeight: "bold" }}
                          >
                            Wallet
                          </Typography>
                        </IconButton>

                        <IconButton
                          className="nav-bar"
                          size="small"
                          onClick={(e) => setAnchorEl(e.currentTarget)}
                          style={{
                            fontWeight: "bold",
                            border: "1px solid white",
                            color: "#FFFFFF",
                            borderRadius: "4px",
                            padding: "4px 8px",
                            marginBottom: "10px",
                          }}
                        >
                          <Typography
                            variant="body2"
                            style={{ fontWeight: "bold" }}
                          >
                            More
                          </Typography>
                        </IconButton>

                        {anchorEl && (
                          <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={() => setAnchorEl(null)}
                          >
                            <MenuItem
                              onClick={() =>
                                navigate(`/position/${position.id}`)
                              }
                            >
                              <Typography color="secondary">
                                {t("sharedShowDetails")}
                              </Typography>
                            </MenuItem>
                            <MenuItem onClick={handleGeofence}>
                              {t("sharedCreateGeofence")}
                            </MenuItem>
                            <MenuItem
                              component="a"
                              target="_blank"
                              href={`https://www.google.com/maps/search/?api=1&query=${position.latitude}%2C${position.longitude}`}
                            >
                              {t("linkGoogleMaps")}
                            </MenuItem>
                            <MenuItem
                              component="a"
                              target="_blank"
                              href={`http://maps.apple.com/?ll=${position.latitude},${position.longitude}`}
                            >
                              {t("linkAppleMaps")}
                            </MenuItem>
                            <MenuItem
                              component="a"
                              target="_blank"
                              href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${position.latitude}%2C${position.longitude}&heading=${position.course}`}
                            >
                              {t("linkStreetView")}
                            </MenuItem>
                            {!shareDisabled && !user.temporary && (
                              <MenuItem
                                onClick={() =>
                                  navigate(`/settings/device/${deviceId}/share`)
                                }
                              >
                                {t("deviceShare")}
                              </MenuItem>
                            )}
                          </Menu>
                        )}
                      </div>
                      <IconButton
                        size="small"
                        onClick={onClose}
                        onTouchStart={onClose}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </div>
                  )}
                  <Divider /> {/* Divider separating the header and content */}
                  {position && (
                    <CardContent className={classes.content}>
                      <Grid container className={classes.gridContainer}>
                        {positionItems
                          .split(",")
                          .filter(
                            (key) =>
                              position.hasOwnProperty(key) ||
                              position.attributes.hasOwnProperty(key)
                          )
                          .map((key) => (
                            <StatusRow
                              key={key}
                              name={positionAttributes[key]?.name || key}
                              content={
                                <PositionValue
                                  position={position}
                                  property={
                                    position.hasOwnProperty(key) ? key : null
                                  }
                                  attribute={
                                    position.hasOwnProperty(key) ? null : key
                                  }
                                />
                              }
                            />
                          ))}
                      </Grid>
                    </CardContent>
                  )}
                  {/*   */}
                </Card>
              </Draggable>
            )}
          </div>
          <RemoveDialog
            open={removing}
            onClose={() => setRemoving(false)}
            onRemove={handleRemove}
          />
        </>
      )}
    </>
  );
};

export default StatusCard;
