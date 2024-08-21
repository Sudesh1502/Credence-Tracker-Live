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



import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import makeStyles from '@mui/styles/makeStyles';
import {
  IconButton, Tooltip, ListItemButton, Typography,
} from '@mui/material';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import Battery60Icon from '@mui/icons-material/Battery60';
import BatteryCharging60Icon from '@mui/icons-material/BatteryCharging60';
import Battery20Icon from '@mui/icons-material/Battery20';
import BatteryCharging20Icon from '@mui/icons-material/BatteryCharging20';
import ErrorIcon from '@mui/icons-material/Error';
import dayjs from 'dayjs';


// import car from '../../public/listVehicles/car.svg';
import { MdGpsFixed } from "react-icons/md";

import relativeTime from 'dayjs/plugin/relativeTime';
import { devicesActions } from '../store';
import {
  formatAlarm, formatBoolean, formatPercentage, formatStatus, getStatusColor,
} from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import { mapIconKey, mapIcons } from '../map/core/preloadImages';
import { useAdministrator } from '../common/util/permissions';
import EngineIcon from '../resources/images/data/engine.svg?react';
import { useAttributePreference } from '../common/util/preferences';


dayjs.extend(relativeTime);

const useStyles = makeStyles((theme) => ({
  icon: {
    width: '83px',
    // height: '150px',
    // filter: 'brightness(0) invert(1)',
  },
  batteryText: {
    fontSize: '0.75rem',
    fontWeight: 'normal',
    lineHeight: '0.875rem',
  },
  success: {
    color: theme.palette.success.main,
  },
  warning: {
    color: theme.palette.warning.main,
  },
  error: {
    color: theme.palette.error.main,
  },
  neutral: {
    color: theme.palette.neutral.main,
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
    paddingBottom: '0px',
    paddingTop: '0px',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[1],
    borderRadius: theme.shape.borderRadius,
    height: 'auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    // marginBottom: theme.spacing(2),
    gap: '124px',
  },
  content: {
    padding: theme.spacing(1),
  },
  address: {
    color: '#000',
    marginBottom: '4px',
  },
  name: {
    color: '#000 !important',
    marginBottom: theme.spacing(1),

  },
  stats: {
    display: 'flex',
    // justifyContent: 'space-between',
    width: '100%',
    justifyContent: 'space-between',
    gap: '10px',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'space-between',
    // justifyContent: 'center',
    width: '50px',
  
  },
  statLabel: {
    color: '#383636',
    fontSize: '0.6rem',

  },
  statLabelData: {
    fontSize: '0.6rem',
    color: '#000',
  },
}));

const DeviceRow = ({ data, index, style }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const t = useTranslation();
  const admin = useAdministrator();

  const item = data[index];
  const position = useSelector((state) => state.session.positions[item.id]);

  const devicePrimary = useAttributePreference('devicePrimary', 'name');
  const deviceSecondary = useAttributePreference('deviceSecondary', '');
  const car = '/listVehicles/car.svg';

  const secondaryText = () => {
    let status;
    if (item.status === 'online' || !item.lastUpdate) {
      status = formatStatus(item.status, t);
    } else {
      status = dayjs(item.lastUpdate).fromNow();
    }
    return (
      <>
        {deviceSecondary && item[deviceSecondary] && `${item[deviceSecondary]} • `}
        <span className={classes[getStatusColor(item.status)]}>{status}</span>
      </>
    );
  };

  return (
    <div style={style} className={classes.card}>
    <ListItemButton
        key={item.id}
        onClick={() => dispatch(devicesActions.selectId(item.id))}
        disabled={!admin && item.disabled}
        sx={{
          flexDirection: 'column',
          alignItems: 'start',
          backgroundColor: '#c3c1bd',
          marginBottom: '10px',
          borderRadius: '10px',
        }}
      >
      <div className={classes.header}>
        <div className="deviceImg">
          {/* <img className={classes.icon} src={mapIcons[mapIconKey(item.category)]} alt="" /> */}
          <img className={classes.icon} src={car} alt="" />
        </div>
  
        {position && (
          <div className="deviceIcons" 
          style={{display: "flex", flexDirection: "column", gap: "10px", alignItems: "center"}}>
            {position.attributes.hasOwnProperty('alarm') && (
              <Tooltip title={`${t('eventAlarm')}: ${formatAlarm(position.attributes.alarm, t)}`}>
                <IconButton size="small">
                  <ErrorIcon fontSize="small" className={classes.error} />
                </IconButton>
              </Tooltip>
            )}
            {position.attributes.hasOwnProperty('ignition') && (
              <Tooltip title={`${t('positionIgnition')}: ${formatBoolean(position.attributes.ignition, t)}`}>
                <IconButton size="small">
                  {position.attributes.ignition ? (
                    <EngineIcon width={20} height={20} className={classes.success} />
                  ) : (
                    <EngineIcon width={20} height={20} className={classes.neutral} />
                  )}
                </IconButton>
              </Tooltip>
            )}
            {position.attributes.hasOwnProperty('batteryLevel') && (
              <Tooltip title={`${t('positionBatteryLevel')}: ${formatPercentage(position.attributes.batteryLevel)}`}>
                <IconButton size="small">
                  {(position.attributes.batteryLevel > 70 && (
                    position.attributes.charge
                      ? (<BatteryChargingFullIcon fontSize="small" className={classes.success} />)
                      : (<BatteryFullIcon fontSize="small" className={classes.success} />)
                  )) || (position.attributes.batteryLevel > 30 && (
                    position.attributes.charge
                      ? (<BatteryCharging60Icon fontSize="small" className={classes.warning} />)
                      : (<Battery60Icon fontSize="small" className={classes.warning} />)
                  )) || (
                    position.attributes.charge
                      ? (<BatteryCharging20Icon fontSize="small" className={classes.error} />)
                      : (<Battery20Icon fontSize="small" className={classes.error} />)
                  )}
                </IconButton>
              </Tooltip>
            )}

            
            <MdGpsFixed />
            
          </div>
        )}
      </div>
      <div style={{color:"#000", fontWeight: "500"}}>
        {item?.name || 'NAme not available'}
      </div>
      <Typography variant="body2" className={classes.address}>
        {position?.address || 'Address not available'}
      </Typography>
      <hr style={{padding:"0px", margin:"0px", width:"100%", marginBottom:"3px"}}/>
      <div className={classes.stats}>
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
      </div>
      </ListItemButton>
    </div>
    
  );
};

export default DeviceRow;
