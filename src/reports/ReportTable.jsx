import React from 'react';
import { Table, TableHead, TableBody, TableRow, TableCell, Paper, TableContainer } from '@mui/material';

const ReportTable = ({ reportData, periodType, dates }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Device Name</TableCell>
            {dates.map((date) => (
              <TableCell key={date}>{periodType === 'day' ? date : dayjs(date).format('MMM YYYY')}</TableCell>
            ))}
            <TableCell>Total Distance (km)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reportData.map((deviceData) => (
            <TableRow key={deviceData.deviceId}>
              <TableCell>{deviceData.deviceName}</TableCell>
              {deviceData.distances.map((distance, idx) => (
                <TableCell key={idx}>{(distance / 1000).toFixed(2)} km</TableCell>
              ))}
              <TableCell>{(deviceData.totalDistance / 1000).toFixed(2)} km</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ReportTable;
