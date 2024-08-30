import React, {
  useState, useEffect, useRef, useCallback,
} from 'react';
import {
  IconButton, Paper, Slider, Toolbar, Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TuneIcon from '@mui/icons-material/Tune';
import DownloadIcon from '@mui/icons-material/Download';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import FastForwardIcon from '@mui/icons-material/FastForward';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import makeStyles from '@mui/styles/makeStyles';
import MapView from '../map/core/MapView';
import MapRoutePath from '../map/MapRoutePath';
import MapRoutePoints from '../map/MapRoutePoints';
import MapPositions from '../map/MapPositions';
import { formatTime } from '../common/util/formatter';
import ReportFilter from '../reports/components/ReportFilter';
import { useTranslation } from '../common/components/LocalizationProvider';
import { useCatch } from '../reactHelper';
import MapCamera from '../map/MapCamera';
import MapGeofence from '../map/MapGeofence';
import StatusCard from '../common/components/StatusCard';
import { usePreference } from '../common/util/preferences';
import "./Replay.css";

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    zIndex: 3,
    left: 0,
    top: 0,
    margin: theme.spacing(1.5),
    width: theme.dimensions.drawerWidthDesktop,
    [theme.breakpoints.down('md')]: {
      width: '100%',
      margin: 0,
    },
  },
  title: {
    flexGrow: 1,
  },
  slider: {
    width: '100%',
  },
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formControlLabel: {
    height: '100%',
    width: '100%',
    paddingRight: theme.spacing(1),
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      margin: theme.spacing(1),
    },
    [theme.breakpoints.up('md')]: {
      marginTop: theme.spacing(1),
    },
  },
}));

const ReplayPage = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const t = useTranslation();

  const timerRef = useRef();
  const [playing, setPlaying] = useState(false);
  const [positions, setPositions] = useState([]);
  const [index, setIndex] = useState(0);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [from, setFrom] = useState();
  const [to, setTo] = useState();
  const [expanded, setExpanded] = useState(true);
  const [history, setHistory] = useState(true);
  const [showCard, setShowCard] = useState(false);

  const deviceName = useSelector((state) => {
    if (selectedDeviceId) {
      const device = state.devices.items[selectedDeviceId];
      if (device) {
        return device.name;
      }
    }
    return null;
  });

  const handleSubmit = useCatch(async ({ deviceId, from, to }) => {
    setSelectedDeviceId(deviceId);
    setFrom(from);
    setTo(to);
    const query = new URLSearchParams({ deviceId, from, to });
    const response = await fetch(`/api/positions?${query.toString()}`);

    if (response.ok) {
      setIndex(0);
      const positions = await response.json();
      setPositions(positions);

      if (positions.length) {
        setExpanded(false);
        setHistory(true);
        setReplayMode(true);
      } else {
        throw Error(t('sharedNoData'));
      }
    } else {
      throw Error(await response.text());
    }
  });

  // Linear interpolation function
  const lerp = (start, end, t) => start + (end - start) * t;

  useEffect(() => {
    if (playing && positions.length > 0) {
      let frame = 0;
      timerRef.current = setInterval(() => {
        const nextIndex = index + 1;

        if (nextIndex < positions.length) {
          const currentPos = positions[index];
          const nextPos = positions[nextIndex];

          const interpolatedLat = lerp(currentPos.latitude, nextPos.latitude, frame / 10);
          const interpolatedLng = lerp(currentPos.longitude, nextPos.longitude, frame / 10);

          // Update the marker position
          const updatedPositions = [...positions];
          updatedPositions[index] = {
            ...currentPos,
            latitude: interpolatedLat,
            longitude: interpolatedLng,
          };
          setPositions(updatedPositions);

          frame += 1;

          if (frame >= 10) {
            setIndex(nextIndex);
            frame = 0;
          }
        } else {
          clearInterval(timerRef.current);
          setPlaying(false);
        }
      }, 50); // Adjust the interval to control the speed of interpolation
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [playing, positions, index]);

  const onPointClick = useCallback((_, index) => {
    setIndex(index);
  }, [setIndex]);

  const onMarkerClick = useCallback((positionId) => {
    setShowCard(!!positionId);
  }, [setShowCard]);

  const handleDownload = () => {
    const query = new URLSearchParams({ deviceId: selectedDeviceId, from, to });
    window.location.assign(`/api/positions/kml?${query.toString()}`);
  };

  return (
    <div className={classes.root}>
      <div className="map">
        <MapView>
          <MapGeofence />
          <MapRoutePath positions={positions} />
          <MapRoutePoints positions={positions} onClick={onPointClick} />
          {index < positions.length && (
            <MapPositions positions={[positions[index]]} onClick={onMarkerClick} titleField="fixTime" />
          )}
        </MapView>
        <MapCamera playing={playing} positions={positions} index={index} replayMode />
      </div>

      <div className="card">
        <Paper elevation={3} square>
          <Toolbar>
            <IconButton edge="start" sx={{ mr: 2 }} onClick={() => navigate(-1)}>
              <ArrowBackIcon onClick={() => {
                setHistory(false);
                setReplayMode(false);
              }} />
            </IconButton>
            <Typography variant="h6" className={classes.title}>{t('reportReplay')}</Typography>
            {!expanded && index < positions.length && (
              <div className={classes.statuscard}>
                <StatusCard
                  deviceId={selectedDeviceId}
                  position={positions[index]}
                  onClose={() => setShowCard(false)}
                  disableActions
                  history={history}
                />
              </div>
            )}
            {!expanded && (
              <>
                <IconButton onClick={handleDownload}>
                  <DownloadIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => setExpanded(true)}>
                  <TuneIcon />
                </IconButton>
              </>
            )}
          </Toolbar>
        </Paper>
        <Paper className={classes.content} square>
          {!expanded ? (
            <>
              <Typography variant="subtitle1" align="center">{deviceName}</Typography>
              <Slider
                className={classes.slider}
                max={positions.length - 1}
                step={null}
                marks={positions.map((_, index) => ({ value: index }))}
                value={index}
                onChange={(_, index) => setIndex(index)}
              />
              <div className={classes.controls}>
                {`${index + 1}/${positions.length}`}
                <IconButton onClick={() => setIndex((index) => index - 1)} disabled={playing || index <= 0}>
                  <FastRewindIcon />
                </IconButton>
                <IconButton onClick={() => setPlaying(!playing)} disabled={index >= positions.length - 1}>
                  {playing ? <PauseIcon /> : <PlayArrowIcon />}
                </IconButton>
                <IconButton onClick={() => setIndex((index) => index + 1)} disabled={playing || index >= positions.length - 1}>
                  <FastForwardIcon />
                </IconButton>
                {positions.length && positions[index] && (
                  <Typography variant="subtitle2">{formatTime(positions[index].fixTime)}</Typography>
                )}
              </div>
            </>
          ) : (
            <ReportFilter deviceId={selectedDeviceId} from={from} to={to} onSubmit={handleSubmit} />
          )}
        </Paper>
      </div>
    </div>
  );
};

export default ReplayPage;
