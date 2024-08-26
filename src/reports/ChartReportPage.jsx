import dayjs from 'dayjs';
import React, { useState } from 'react';
import {
  FormControl, InputLabel, Select, MenuItem, Box, TextField, InputAdornment,
  Fab, Menu, MenuItem as MuiMenuItem
} from '@mui/material';
import {
  CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import ReportFilter from './components/ReportFilter';
import { formatTime } from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import ReportsMenu from './components/ReportsMenu';
import usePositionAttributes from '../common/attributes/usePositionAttributes';
import { useCatch } from '../reactHelper';
import { useAttributePreference, usePreference } from '../common/util/preferences';
import {
  altitudeFromMeters, distanceFromMeters, speedFromKnots, volumeFromLiters,
} from '../common/util/converter';
import useReportStyles from './common/useReportStyles';
import Search from '@mui/icons-material/Search';  // Importing the Search icon
import Settings from '@mui/icons-material/Settings';  // Importing the Settings icon
import GetApp from '@mui/icons-material/GetApp';  // Importing the GetApp icon

const ChartReportPage = () => {
  const classes = useReportStyles();
  const t = useTranslation();

  const positionAttributes = usePositionAttributes(t);

  const distanceUnit = useAttributePreference('distanceUnit');
  const altitudeUnit = useAttributePreference('altitudeUnit');
  const speedUnit = useAttributePreference('speedUnit');
  const volumeUnit = useAttributePreference('volumeUnit');
  const hours12 = usePreference('twelveHourFormat');

  const [items, setItems] = useState([]);
  const [types, setTypes] = useState(['speed']);
  const [type, setType] = useState('speed');
  const [searchQuery, setSearchQuery] = useState('');

  const [anchorEl, setAnchorEl] = useState(null); // State for the settings menu

  const values = items.map((it) => it[type]);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue;

  const handleSubmit = useCatch(async ({ deviceId, from, to }) => {
    const query = new URLSearchParams({ deviceId, from, to });
    const response = await fetch(`/api/reports/route?${query.toString()}`, {
      headers: { Accept: 'application/json' },
    });
    if (response.ok) {
      const positions = await response.json();
      const keySet = new Set();
      const keyList = [];
      const formattedPositions = positions.map((position) => {
        const data = { ...position, ...position.attributes };
        const formatted = {};
        formatted.fixTime = dayjs(position.fixTime).valueOf();
        Object.keys(data).filter((key) => !['id', 'deviceId'].includes(key)).forEach((key) => {
          const value = data[key];
          if (typeof value === 'number') {
            keySet.add(key);
            const definition = positionAttributes[key] || {};
            switch (definition.dataType) {
              case 'speed':
                formatted[key] = speedFromKnots(value, speedUnit).toFixed(2);
                break;
              case 'altitude':
                formatted[key] = altitudeFromMeters(value, altitudeUnit).toFixed(2);
                break;
              case 'distance':
                formatted[key] = distanceFromMeters(value, distanceUnit).toFixed(2);
                break;
              case 'volume':
                formatted[key] = volumeFromLiters(value, volumeUnit).toFixed(2);
                break;
              case 'hours':
                formatted[key] = (value / 1000).toFixed(2);
                break;
              default:
                formatted[key] = value;
                break;
            }
          }
        });
        return formatted;
      });
      Object.keys(positionAttributes).forEach((key) => {
        if (keySet.has(key)) {
          keyList.push(key);
          keySet.delete(key);
        }
      });
      setTypes([...keyList, ...keySet]);
      setItems(formattedPositions);
    } else {
      throw Error(await response.text());
    }
  });

  const handleSettingsClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDownload = () => {
    // Implement your download logic here
    handleClose();
  };

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'reportChart']}>
      <div className={classes.header}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 30px",
          }}
        >
          <h2>Custom Chart</h2>

          <TextField
            variant="outlined"
            size="small"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ minWidth: "300px" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </div>

      <ReportFilter handleSubmit={handleSubmit} showOnly>
        <div className={classes.filterItem}>
          <FormControl fullWidth>
            <InputLabel>{t('reportChartType')}</InputLabel>
            <Select
              label={t('reportChartType')}
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={!items.length}
            >
              {types.map((key) => (
                <MenuItem key={key} value={key}>{positionAttributes[key]?.name || key}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </ReportFilter>
      
      {items.length > 0 && (
        <div className={classes.chart}>
          <ResponsiveContainer>
            <LineChart
              data={items}
              margin={{
                top: 10, right: 40, left: 0, bottom: 10,
              }}
            >
              <XAxis
                dataKey="fixTime"
                type="number"
                tickFormatter={(value) => formatTime(value, 'time', hours12)}
                domain={['dataMin', 'dataMax']}
                scale="time"
              />
              <YAxis
                type="number"
                tickFormatter={(value) => value.toFixed(2)}
                domain={[minValue - valueRange / 5, maxValue + valueRange / 5]}
              />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip
                formatter={(value, key) => [value, positionAttributes[key]?.name || key]}
                labelFormatter={(value) => formatTime(value, 'seconds', hours12)}
              />
              <Line type="monotone" dataKey={type} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Settings Button */}
      <Fab
        color="primary"
        aria-label="settings"
        sx={{ position: "fixed", bottom: 16, right: 16 }}
        onClick={handleSettingsClick}
      >
        <Settings />
      </Fab>

      {/* Settings Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MuiMenuItem onClick={handleDownload}>
          <GetApp sx={{ marginRight: 1 }} />
          Download
        </MuiMenuItem>
      </Menu>
    </PageLayout>
  );
};

export default ChartReportPage;
