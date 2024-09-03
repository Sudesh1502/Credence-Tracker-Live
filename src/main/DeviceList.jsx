import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import makeStyles from '@mui/styles/makeStyles';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { devicesActions } from '../store';
import DeviceRow from './DeviceRow'; // Ensure this is correctly imported
import { styled } from '@mui/material';

const useStyles = makeStyles((theme) => ({
  list: {
    maxHeight: '100%',
    '& > div::-webkit-scrollbar': {
      display: 'none', /* Chrome, Safari, and Opera */
    },
  },
  listInner: {
    position: 'relative',
    margin: theme.spacing(1.5, 0),
  },
}));

const DeviceList = ({ devices, filteredDevices }) => {

  const classes = useStyles();
  const dispatch = useDispatch();
  const listInnerEl = useRef(null);

  // Debugging log to check the devices prop
  // console.log("DeviceList received devices:", devices);

  if (listInnerEl.current) {
    listInnerEl.current.className = classes.listInner;
  }

  const [, setTime] = useState(Date.now());

  useEffect(() => {
    
    const interval = setInterval(() => setTime(Date.now()), 60000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <AutoSizer className={classes.list}>
      {({ height, width }) => (
        <FixedSizeList
          width={width}
          height={height}
          itemCount={devices.length}
          itemData={devices} // Still passing the array for context
          itemSize={145}
          overscanCount={10}
          innerRef={listInnerEl}
        >
          {({ index, style }) => (
            <DeviceRow
              key={devices[index].id}
              data={devices[index]} // Pass each individual device object
              index={index}
              style={style}
            />
          )}
        </FixedSizeList>
      )}
    </AutoSizer>
  );
};

export default DeviceList;
