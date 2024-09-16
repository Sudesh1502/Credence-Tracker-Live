// import React from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import makeStyles from '@mui/styles/makeStyles';
// import {
//   IconButton, Tooltip, Avatar, ListItemAvatar, ListItemText, ListItemButton,
// } from '@mui/material';
// import BatteryFullIcon from '@mui/icons-material/BatteryFull';
// import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
// import Battery60Icon from '@mui/icons-material/Battery60';
// import BatteryCharging60Icon from '@mui/icons-material/BatteryCharging60';
// import Battery20Icon from '@mui/icons-material/Battery20';
// import BatteryCharging20Icon from '@mui/icons-material/BatteryCharging20';
// import ErrorIcon from '@mui/icons-material/Error';
// import dayjs from 'dayjs';
// import relativeTime from 'dayjs/plugin/relativeTime';
// import { devicesActions } from '../store';
// import {
//   formatAlarm, formatBoolean, formatPercentage, formatStatus, getStatusColor,
// } from '../common/util/formatter';
// import { useTranslation } from '../common/components/LocalizationProvider';
// import { mapIconKey, mapIcons } from '../map/core/preloadImages';
// import { useAdministrator } from '../common/util/permissions';
// import EngineIcon from '../resources/images/data/engine.svg?react';
// import { useAttributePreference } from '../common/util/preferences';

// dayjs.extend(relativeTime);

// const useStyles = makeStyles((theme) => ({
//   icon: {
//     width: '25px',
//     height: '25px',
//     filter: 'brightness(0) invert(1)',
//   },
//   batteryText: {
//     fontSize: '0.75rem',
//     fontWeight: 'normal',
//     lineHeight: '0.875rem',
//   },
//   success: {
//     color: theme.palette.success.main,
//   },
//   warning: {
//     color: theme.palette.warning.main,
//   },
//   error: {
//     color: theme.palette.error.main,
//   },
//   neutral: {
//     color: theme.palette.neutral.main,
//   },
// }));

// const DeviceRow = ({ data, index, style }) => {
//   const classes = useStyles();
//   const dispatch = useDispatch();
//   const t = useTranslation();

//   const admin = useAdministrator();

//   const item = data[index];
//   const position = useSelector((state) => state.session.positions[item.id]);
//   console.log('====================================================item', item);
//   console.log('====================================================position', position);

//   const devicePrimary = useAttributePreference('devicePrimary', 'name');
//   const deviceSecondary = useAttributePreference('deviceSecondary', '');

//   const secondaryText = () => {
//     let status;
//     if (item.status === 'online' || !item.lastUpdate) {
//       status = formatStatus(item.status, t);
//     } else {
//       status = dayjs(item.lastUpdate).fromNow();
//     }
//     return (
//       <>
//         {deviceSecondary && item[deviceSecondary] && `${item[deviceSecondary]} • `}
//         <span className={classes[getStatusColor(item.status)]}>{status}</span>
//       </>
//     );
//   };

//   return (
//     <div style={style}>
//       <ListItemButton
//         key={item.id}
//         onClick={() => dispatch(devicesActions.selectId(item.id))}
//         disabled={!admin && item.disabled}
//       >
//         <ListItemAvatar>
//           <Avatar>
//             <img className={classes.icon} src={mapIcons[mapIconKey(item.category)]} alt="" />
//           </Avatar>
//         </ListItemAvatar>
//         <ListItemText
//           primary={item[devicePrimary]}
//           primaryTypographyProps={{ noWrap: true }}
//           secondary={secondaryText()}
//           secondaryTypographyProps={{ noWrap: true }}
//         />
//         {position && (
//           <>
//             {position.attributes.hasOwnProperty('alarm') && (
//               <Tooltip title={`${t('eventAlarm')}: ${formatAlarm(position.attributes.alarm, t)}`}>
//                 <IconButton size="small">
//                   <ErrorIcon fontSize="small" className={classes.error} />
//                 </IconButton>
//               </Tooltip>
//             )}
//             {position.attributes.hasOwnProperty('ignition') && (
//               <Tooltip title={`${t('positionIgnition')}: ${formatBoolean(position.attributes.ignition, t)}`}>
//                 <IconButton size="small">
//                   {position.attributes.ignition ? (
//                     <EngineIcon width={20} height={20} className={classes.success} />
//                   ) : (
//                     <EngineIcon width={20} height={20} className={classes.neutral} />
//                   )}
//                 </IconButton>
//               </Tooltip>
//             )}
//             {position.attributes.hasOwnProperty('batteryLevel') && (
//               <Tooltip title={`${t('positionBatteryLevel')}: ${formatPercentage(position.attributes.batteryLevel)}`}>
//                 <IconButton size="small">
//                   {(position.attributes.batteryLevel > 70 && (
//                     position.attributes.charge
//                       ? (<BatteryChargingFullIcon fontSize="small" className={classes.success} />)
//                       : (<BatteryFullIcon fontSize="small" className={classes.success} />)
//                   )) || (position.attributes.batteryLevel > 30 && (
//                     position.attributes.charge
//                       ? (<BatteryCharging60Icon fontSize="small" className={classes.warning} />)
//                       : (<Battery60Icon fontSize="small" className={classes.warning} />)
//                   )) || (
//                     position.attributes.charge
//                       ? (<BatteryCharging20Icon fontSize="small" className={classes.error} />)
//                       : (<Battery20Icon fontSize="small" className={classes.error} />)
//                   )}
//                 </IconButton>
//               </Tooltip>
//             )}
//           </>
//         )}
//       </ListItemButton>
//     </div>
//   );
// };

// export default DeviceRow;

import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import makeStyles from "@mui/styles/makeStyles";
import { IconButton, Tooltip, ListItemButton, Typography } from "@mui/material";
import BatteryFullIcon from "@mui/icons-material/BatteryFull";
import BatteryChargingFullIcon from "@mui/icons-material/BatteryChargingFull";
import Battery60Icon from "@mui/icons-material/Battery60";
import BatteryCharging60Icon from "@mui/icons-material/BatteryCharging60";
import Battery20Icon from "@mui/icons-material/Battery20";
import BatteryCharging20Icon from "@mui/icons-material/BatteryCharging20";
import ErrorIcon from "@mui/icons-material/Error";
import dayjs from "dayjs";

// ================================CAR==================================
import carGreen from "../../public/vehicleList/Car/carGreen.svg";
import carRed from "../../public/vehicleList/Car/carRed.svg";
import carYellow from "../../public/vehicleList/Car/carYellow.svg";
import carOrange from "../../public/vehicleList/Car/carOrange.svg";
import carGray from "../../public/vehicleList/Car/carGray.svg";

//==============================BIKE========================================
import bikeGreen from "../../public/vehicleList/Bike/bikeGreen.svg";
import bikeRed from "../../public/vehicleList/Bike/bikeRed.svg";
import bikeYellow from "../../public/vehicleList/Bike/bikeYellow.svg";
import bikeOrange from "../../public/vehicleList/Bike/bikeOrange.svg";
import bikeGray from "../../public/vehicleList/Bike/bikeGray.svg";

//==============================TRUCK========================================
import truckGreen from "../../public/vehicleList/Truck/truckGreen.svg";
import truckRed from "../../public/vehicleList/Truck/truckRed.svg";
import truckYellow from "../../public/vehicleList/Truck/truckYellow.svg";
import truckOrange from "../../public/vehicleList/Truck/truckOrange.svg";
import truckGray from "../../public/vehicleList/Truck/truckGray.svg";

//==============================CRANE========================================
import craneGreen from "../../public/vehicleList/Crane/craneGreen.svg";
import craneRed from "../../public/vehicleList/Crane/craneRed.svg";
import craneYellow from "../../public/vehicleList/Crane/craneYellow.svg";
import craneOrange from "../../public/vehicleList/Crane/craneOrange.svg";
import craneGray from "../../public/vehicleList/Crane/craneGray.svg";

//==============================JCB========================================
import jcbGreen from "../../public/vehicleList/JCB/jcbGreen.svg";
import jcbRed from "../../public/vehicleList/JCB/jcbRed.svg";
import jcbYellow from "../../public/vehicleList/JCB/jcbYellow.svg";
import jcbOrange from "../../public/vehicleList/JCB/jcbOrange.svg";
import jcbGray from "../../public/vehicleList/JCB/jcbGray.svg";

//==============================AUTO========================================
import autoGreen from "../../public/vehicleList/Auto/autoGreen.svg";
import autoRed from "../../public/vehicleList/Auto/autoRed.svg";
import autoYellow from "../../public/vehicleList/Auto/autoYellow.svg";
import autoOrange from "../../public/vehicleList/Auto/autoOrange.svg";
import autoGray from "../../public/vehicleList/Auto/autoGray.svg";

//==============================Tractor========================================
// import tractorGreen from '../../public/vehicleList/Tractor/tractorGreen.svg';
// import tractorRed from '../../public/vehicleList/Tractor/tractorRed.svg';
// import tractorYellow from '../../public/vehicleList/Tractor/tractorYellow.svg';
// import tractorOrange from '../../public/vehicleList/Tractor/tractorOrange.svg';
// import tractorGray from '../../public/vehicleList/Tractor/tractorGray.svg';

// import car from '../../public/listVehicles/car.svg';
import { MdGpsFixed } from "react-icons/md";
import { MdOutlineSignalCellularAlt } from "react-icons/md";
import { FaHistory } from "react-icons/fa";
import { SiNginxproxymanager } from "react-icons/si";
import { MdNotificationsActive } from "react-icons/md";

import { GiSpeedometer } from "react-icons/gi";
import { GiPathDistance } from "react-icons/gi";
import { RiAccountBoxFill } from "react-icons/ri";
import { TbReport } from "react-icons/tb";

import relativeTime from "dayjs/plugin/relativeTime";
import { devicesActions } from "../store";
import {
  formatAlarm,
  formatBoolean,
  formatPercentage,
  formatStatus,
  getStatusColor,
} from "../common/util/formatter";
import { useTranslation } from "../common/components/LocalizationProvider";
import { mapIconKey, mapIcons } from "../map/core/preloadImages";
import { useAdministrator } from "../common/util/permissions";
import EngineIcon from "../resources/images/data/engine.svg?react";
import { useAttributePreference } from "../common/util/preferences";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

dayjs.extend(relativeTime);

const useStyles = makeStyles((theme) => ({
  icon: {
    width: "83px",
    // height: '150px',
    // filter: 'brightness(0) invert(1)',
  },
  // batteryText: {
  //   fontSize: '0.75rem',
  //   fontWeight: 'normal',
  //   lineHeight: '0.875rem',
  // },
  success: {
    color: "green",
  },
  warning: {
    color: theme.palette.warning.main,
  },
  error: {
    color: theme.palette.error.main,
  },
  neutral: {
    color: "red",
  },
  dead: {
    color: "gray",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(2),
    paddingBottom: "0px",
    paddingTop: "0px",
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[1],
    borderRadius: theme.shape.borderRadius,
    height: "100%",
    marginBottom: "20px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    // marginBottom: theme.spacing(2),
    gap: "18px",
  },
  content: {
    padding: theme.spacing(1),
  },
  address: {
    color: "#000",
    marginBottom: "4px",
    fontSize: "0.7rem",
  },
  name: {
    color: "#000 !important",
    marginBottom: theme.spacing(1),
  },
  stats: {
    display: "flex",
    // justifyContent: 'space-between',
    width: "100%",
    justifyContent: "space-between",
    gap: "10px",
  },
  statItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "space-between",
    // justifyContent: 'center',
    width: "50px",
  },
  statLabel: {
    color: "#383636",
    fontSize: "0.6rem",
  },
  statLabelData: {
    fontSize: "0.7rem",
    color: "#000",
    fontWeight: "600",
    height: "100%",
  },
  lastUpdate: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    width: "10rem",
  },
  speed: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  todayDistance: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  ld: {
    fontSize: "0.8rem",
    color: "#000",
    height: "100%",
  },
  cd: {
    fontSize: "0.8rem",
    color: "#000",
    height: "100%",
  },
  sd: {
    fontSize: "1rem",
    color: "#000",
    height: "100%",
  },
  nameAddress: {
    width: "15rem",
  },
  controlNavigation: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "95%",
    gap: "5rem",
    flexDirection: "row",
    marginTop: "5px",
  },
  controlBtn: {
    color: "#000",
    fontSize: "1.2rem",
  },
}));

const DeviceRow = ({ data, index, style }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const t = useTranslation();
  const admin = useAdministrator();

  const item = data;
  const position = useSelector((state) => state.session.positions[item.id]);

  const devicePrimary = useAttributePreference("devicePrimary", "name");
  const deviceSecondary = useAttributePreference("deviceSecondary", "");
  const car = "/listVehicles/car.svg";
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (position && position.latitude && position.longitude) {
      setLat(position.latitude);
      setLon(position.longitude);
    }
  }, [position]);


  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const response = await fetch(`https://apis.mapmyindia.com/advancedmaps/v1/6b4c79eda39393c891e8c4b36ea54bd9/reverse_geocode?lat=${lat}&lon=${lon}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const address = data.results[0]?.formatted_address;
        setAddress(address || 'Address not found');
      } catch (error) {
        console.error('Error fetching address:', error);
        setAddress('Error fetching address');
      }
    };
  
    if (lat && lon) {
      fetchAddress(); // Fetch address when lat or lng changes
    }
  }, [lat, lon]);

  const secondaryText = () => {
    let status;
    if (item.status === "online" || !item.lastUpdate) {
      status = formatStatus(item.status, t);
    } else {
      status = dayjs(item.lastUpdate).fromNow();
    }
    return (
      <>
        {deviceSecondary &&
          item[deviceSecondary] &&
          `${item[deviceSecondary]} • `}
        <span className={classes[getStatusColor(item.status)]}>{status}</span>
      </>
    );
  };

  // ======================SELECTING VEHICLE===================================================
  const getCategory = (category) => {
    switch (category) {
      case "car":
        return "car";
      case "truck":
        return "truck";
      case "motorcycle":
        return "bike"; // Adjusted to match the imageMap key
      case "auto":
        return "auto";
      case "tractor":
        return "crane";
      case "jcb":
        return "jcb";
      default:
        return "car"; // Default case
    }
  };

  const selectImage = (category) => {
    const cate = getCategory(category);
    let image;

    const imageMap = {
      car: {
        red: carRed,
        green: carGreen,
        yellow: carYellow,
        orange: carOrange,
        gray: carGray,
      },
      bike: {
        red: bikeRed,
        green: bikeGreen,
        yellow: bikeYellow,
        orange: bikeOrange,
        gray: bikeGray,
      },
      truck: {
        red: truckRed,
        green: truckGreen,
        yellow: truckYellow,
        orange: truckOrange,
        gray: truckGray,
      },
      auto: {
        red: autoRed,
        green: autoGreen,
        yellow: autoYellow,
        orange: autoOrange,
        gray: autoGray,
      },
      jcb: {
        red: jcbRed,
        green: jcbGreen,
        yellow: jcbYellow,
        orange: jcbOrange,
        gray: jcbGray,
      },
      crane: {
        red: craneRed,
        green: craneGreen,
        yellow: craneYellow,
        orange: craneOrange,
        gray: craneGray,
      },
      tractor: {
        red: craneRed,
        green: craneGreen,
        yellow: craneYellow,
        orange: craneOrange,
        gray: craneGray,
      },
    };

    // Safely handle undefined position or attributes
    if (!position || !position.attributes) {
      // Handle the case where position or attributes are undefined
      return imageMap[cate]?.gray || car; // Return a gray or default image
    }

    const ignition = position.attributes.ignition;
    const speed = position.speed || 0;

    if (!ignition && speed < 1) {
      image = imageMap[cate].red;
    } else if (ignition && speed > 2 && speed < 60) {
      image = imageMap[cate].green;
    } else if (ignition && speed < 2) {
      image = imageMap[cate].yellow;
    } else if (ignition && speed > 60) {
      image = imageMap[cate].orange;
    } else {
      image = imageMap[cate].gray;
    }

    return image || car; // Return a default image if no match found
  };

  // ===============================NAVIGATION==================================================
  const navigate = useNavigate();

  const handleNavigateToLogs = (vehicleId) => {
    // console.log("============================", vehicleId);
    navigate(`reports/combined/${vehicleId}`); // Navigate to the LogsPage when the icon is clicked
  };

  const handleNavigateToReplay = (vehicleHistoryId) => {
    navigate(`replay/${vehicleHistoryId}`);
  };

  const handleNavigateToDriver = () => {
    navigate("settings/drivers");
  };

  const handleNavigateToMaintainance = () => {
    navigate("settings/maintenances");
  };

  const handleNavigateToNotifications = (vehicleId) => {
    navigate(`reports/event/${vehicleId}`);
  };

  return (
    <div style={style} className={classes.card}>
      <ListItemButton
        key={item.id}
        onClick={() =>{ 
          dispatch(devicesActions.selectId(item.id))
          console.log(item);
        }}
        disabled={!admin && item.disabled}
        sx={{
          flexDirection: "row",
          justifyContent: 'space-between',
          alignItems: "start",
          backgroundColor: "#fff",
          borderRadius: "10px",
          marginBottom: "10px",
          transition: "0.4s ease-in-out", // Optional: Smooth transition for hover effect
          "&:hover": {
            backgroundColor: "#c3c1bd",
          },
          paddingBottom: "0",
        }}
      >
        <div className="divtoseperate" 
        style={{
          width: '94%',
        }}
        >
        <div className={classes.header}>
          <div className="deviceImg">
            {/* <img className={classes.icon}  src={mapIcons[mapIconKey(item.category)]} alt="" /> */}
            <img
              className={classes.icon}
              src={selectImage(item.category)}
              alt=""
            />
          </div>

          {/* =====================================================================================================================*/}

          <div className={classes.nameAddress}>
            <div
              style={{ color: "#000", fontWeight: "500", marginBottom: "7px" }}
            >
              {item?.name || "NAme not available"}
            </div>

            <Typography variant="body2" className={classes.address}>
              {address || "Loading vehicle address..."}
            </Typography>
          </div>

          <div
            className="information"
            style={{ display: "flex", flexDirection: "column", gap: "2px" }}
          >
            <div className={classes.lastUpdate}>
              <div className={classes.ld}>L/D :&nbsp;</div>
              <Typography variant="body2" className={classes.statLabelData}>
                {new Date(item.lastUpdate).toLocaleString()}
              </Typography>
            </div>
            <div className={classes.speed}>
              <div className={classes.sd}>
                <GiSpeedometer /> &nbsp;:&nbsp;&nbsp;
              </div>

              <Typography variant="body2" className={classes.statLabelData}>
                {(position?.speed || 0).toFixed(1)} Km/hr
              </Typography>
            </div>
            <div className={classes.todayDistance}>
              <div className={classes.cd}>C/D :&nbsp;</div>
              <Typography variant="body2" className={classes.statLabelData}>
                {(position?.attributes?.distance || 0).toFixed(2)} km
              </Typography>
            </div>
          </div>

          {/* =========================================================================================================================== */}

          
        </div>

        <hr
          style={{
            padding: "0px",
            margin: "0px",
            width: "100%",
            marginBottom: "3px",
            marginTop: "8px",
          }}
        />

        <div className={classes.controlNavigation}>
          <div className={classes.controlBtn}>
            <RiAccountBoxFill onClick={handleNavigateToDriver} />
          </div>
          <div className={classes.controlBtn}>
            <FaHistory
              onClick={() => {
                handleNavigateToReplay(item.id);
              }}
            />
          </div>
          <div className={classes.controlBtn}>
            <SiNginxproxymanager onClick={handleNavigateToMaintainance} />
          </div>
          <div className={classes.controlBtn}>
            <TbReport
              onClick={() => {
                handleNavigateToLogs(item.id);
              }}
            />
          </div>
          <div className={classes.controlBtn}>
            <MdNotificationsActive
              onClick={() => {
                handleNavigateToNotifications(item.id);
              }}
            />
          </div>
        </div>


        </div>

        {/* <div className={classes.stats}>
        <div className={classes.statItem}>
          <Typography variant="body2" className={classes.statLabel}
          sx={{}}>Last Update</Typography>
          <Typography variant="body2"className={classes.statLabelData}>{new Date(item.lastUpdate).toLocaleString()}</Typography>
        </div>
        <hr />
        <div className={classes.statItem}>
          <Typography variant="body2" className={classes.statLabel}
          sx={{}}>Today's Km</Typography>
          <Typography variant="body2"className={classes.statLabelData}>{(position?.attributes?.distance || 0).toFixed(2)} km</Typography>
        </div>
        <hr />
        <div className={classes.statItem}>
          <Typography variant="body2" className={classes.statLabel}
          sx={{}}>Total Km</Typography>
          <Typography variant="body2"className={classes.statLabelData}>{(position?.attributes?.totalDistance / 1000 || 0).toFixed(2)} km</Typography>
        </div>
        <hr />
        <div className={classes.statItem}>
          <Typography variant="body2" className={classes.statLabel}>Speed</Typography>
          <Typography variant="body2"className={classes.statLabelData}>{(position?.speed || 0).toFixed(1)} Km/hr</Typography>
        </div>
      </div> */}
      {position && (
            <div
              className="deviceIcons"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                height: '100%',
                gap: '0.6rem',
              }}
            >
              {/* {position.attributes.hasOwnProperty("alarm") && (
                <Tooltip
                  title={`${t("eventAlarm")}: ${formatAlarm(
                    position.attributes.alarm,
                    t
                  )}`}
                >
                  <IconButton size="small">
                    <ErrorIcon fontSize="small" className={classes.error} />
                  </IconButton>
                </Tooltip>
              )} */}
              {(position.attributes.hasOwnProperty("ignition") && (
                <Tooltip
                  sx={{
                    margin: "0",
                    padding: "0",
                  }}
                  title={`${t("positionIgnition")}: ${formatBoolean(
                    position.attributes.ignition,
                    t
                  )}`}
                >
                  <IconButton size="small">
                    {position.attributes.ignition ? (
                      <EngineIcon
                        width={20}
                        height={20}
                        className={classes.success}
                      />
                    ) : (
                      <EngineIcon
                        width={20}
                        height={20}
                        className={classes.neutral}
                      />
                    )}
                  </IconButton>
                </Tooltip>
              )) || (
                <EngineIcon width={20} height={20} className={classes.dead} />
              )}

              {(position.attributes.hasOwnProperty("batteryLevel") && (
                <Tooltip
                  title={`${t("positionBatteryLevel")}: ${formatPercentage(
                    position.attributes.batteryLevel
                  )}`}
                >
                  <IconButton size="small">
                    {position.attributes.batteryLevel > 70 ? (
                      position.attributes.charge ? (
                        <BatteryChargingFullIcon
                          fontSize="small"
                          className={classes.success}
                        />
                      ) : (
                        <BatteryFullIcon
                          fontSize="small"
                          className={classes.success}
                        />
                      )
                    ) : position.attributes.batteryLevel > 30 ? (
                      position.attributes.charge ? (
                        <BatteryCharging60Icon
                          fontSize="small"
                          className={classes.warning}
                        />
                      ) : (
                        <BatteryCharging60Icon
                          fontSize="small"
                          className={classes.warning}
                        />
                      )
                    ) : position.attributes.charge ? (
                      <BatteryCharging20Icon
                        fontSize="small"
                        className={classes.error}
                      />
                    ) : (
                      <BatteryCharging20Icon
                        fontSize="small"
                        className={classes.error}
                      />
                    )}
                  </IconButton>
                </Tooltip>
              )) || (
                <BatteryCharging20Icon
                  fontSize="small"
                  className={classes.dead}
                />
              )}

              {position.valid ? (
                <MdGpsFixed className={classes.success} />
              ) : (
                <MdGpsFixed className={classes.neutral} />
              )}

              {position.valid ? (
                <MdOutlineSignalCellularAlt className={classes.success} />
              ) : (
                <MdOutlineSignalCellularAlt className={classes.neutral} />
              )}

              {/* {console.log(position)} */}
            </div>
          )}
      </ListItemButton>

      
    </div>
  );
};

export default DeviceRow;
