import axios from 'axios';
import dayjs from 'dayjs';


const DEVICE_API_URL = '/api/devices';

export const fetchDevices = async () => {
  const response = await axios.get(DEVICE_API_URL);
  return response.data;
};

export const fetchReportData = async (deviceIds, fromDate, toDate) => {
  const url = `/api/reports/route?from=${fromDate}&to=${toDate}&deviceId=${deviceIds.join('&deviceId=')}`;
  const response = await axios.get(url, { responseType: 'blob' });
  return response;
};

export const convertToIST = (date) => dayjs(date).add(5, 'hour').add(30, 'minute').toISOString();
