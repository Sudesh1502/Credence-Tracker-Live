import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IconButton, Paper, Slider, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import FastForwardIcon from '@mui/icons-material/FastForward';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import DownloadIcon from '@mui/icons-material/Download';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import MapView from '../map/core/MapView';
import MapRoutePath from '../map/MapRoutePath';
import MapRoutePoints from '../map/MapRoutePoints';
import MapPositions from '../map/MapPositions';
import ReportFilter from '../reports/components/ReportFilter';
import { formatTime } from '../common/util/formatter';
import { usePreference } from '../common/util/preferences';

import './Replay.css';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  mapView: {
    // flexGrow: 1,
    height: '100vh',
    marginTop: '10px',
    borderRadius: '6px',
    overflow: 'hidden',
    // height: '500px', // Set the desired height
    width: '95%',
    // borderRadius: '6px',
  },
  controlsContainer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  slider: {
    width: '100%',
    margin: theme.spacing(2, 0),
  },
  playbackControls: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    margin: theme.spacing(1),
  },
  filterContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
  },
  downloadButton: {
    alignSelf: 'flex-end',
  },
  filter: {
    gap: '16px',
    display: 'inline-flex',
    padding: '24px 16px 16px',
    flexWrap: 'nowrap !important' ,
    width: '48%',
  }

}));

const ReplayPage = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const timerRef = useRef();

  const hours12 = usePreference('twelveHourFormat');

  const defaultDeviceId = useSelector((state) => state.devices.selectedId);

  const [positions, setPositions] = useState([]);
  const [index, setIndex] = useState(0);
  const [selectedDeviceId, setSelectedDeviceId] = useState(defaultDeviceId);
  const [playing, setPlaying] = useState(false);

  const deviceName = useSelector((state) => {
    if (selectedDeviceId) {
      const device = state.devices.items[selectedDeviceId];
      if (device) {
        return device.name;
      }
    }
    return null;
  });

  useEffect(() => {
    if (playing && positions.length > 0) {
      timerRef.current = setInterval(() => {
        setIndex((index) => index + 1);
      }, 500);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [playing, positions]);

  useEffect(() => {
    if (index >= positions.length - 1) {
      clearInterval(timerRef.current);
      setPlaying(false);
    }
  }, [index, positions]);

  const onPointClick = useCallback((_, index) => {
    setIndex(index);
  }, [setIndex]);

  const handleSubmit = async ({ deviceId, from, to }) => {
    setSelectedDeviceId(deviceId);
    const query = new URLSearchParams({ deviceId, from, to });
    const response = await fetch(`/api/positions?${query.toString()}`);
    if (response.ok) {
      setIndex(0);
      const positions = await response.json();
      setPositions(positions);
    }
  };

  const handleDownload = () => {
    const query = new URLSearchParams({ deviceId: selectedDeviceId, from, to });
    window.location.assign(`/api/positions/kml?${query.toString()}`);
  };

  return (
    <div className={classes.root}>
      <Typography variant="h6" align="center">{deviceName}</Typography>
      
      <div className={classes.mapView}>
        <MapView>
          <MapRoutePath positions={positions} />
          <MapRoutePoints positions={positions} onClick={onPointClick} />
          {index < positions.length && (
            <MapPositions positions={[positions[index]]} titleField="fixTime" />
          )}
        </MapView>
      </div>
      
      <div className={classes.controlsContainer}>
        <div className={classes.filterContainer}>
          <ReportFilter handleSubmit={handleSubmit} showOnly />
          <IconButton className={classes.downloadButton} onClick={handleDownload}>
            <DownloadIcon />
          </IconButton>
        </div>

        <Slider
          className={classes.slider}
          max={positions.length - 1}
          step={null}
          marks={positions.map((_, index) => ({ value: index }))}
          value={index}
          onChange={(_, index) => setIndex(index)}
        />
        
        <div className={classes.playbackControls}>
          <IconButton 
            className={classes.controlButton} 
            onClick={() => setIndex((index) => index - 1)} 
            disabled={playing || index <= 0}
          >
            <FastRewindIcon />
          </IconButton>
          <IconButton 
            className={classes.controlButton} 
            onClick={() => setPlaying(!playing)} 
            disabled={index >= positions.length - 1}
          >
            {playing ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
          <IconButton 
            className={classes.controlButton} 
            onClick={() => setIndex((index) => index + 1)} 
            disabled={playing || index >= positions.length - 1}
          >
            <FastForwardIcon />
          </IconButton>
        </div>
        
        {index < positions.length && (
          <Typography variant="body2">
            {formatTime(positions[index]?.fixTime, 'seconds', hours12)}
          </Typography>
        )}
      </div>
    </div>
  );
};

export default ReplayPage;
