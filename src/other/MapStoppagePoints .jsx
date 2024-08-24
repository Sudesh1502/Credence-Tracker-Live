import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Define a custom icon for stoppage points
const stoppageIcon = new L.Icon({
  iconUrl: '/path-to-stoppage-icon.png', // Replace with the correct path to your stoppage icon
  iconSize: [25, 25], // Size of the icon
  iconAnchor: [12, 25], // Point of the icon which will correspond to marker's location
  popupAnchor: [0, -25], // Point from which the popup should open relative to the iconAnchor
});

// Utility function to format the duration (assumes you have this function)
const formatDuration = (duration) => {
  const minutes = Math.floor(duration / 60000);
  const seconds = ((duration % 60000) / 1000).toFixed(0);
  return `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;
};

// Utility function to format time (assumes you have this function)
const formatTime = (time) => {
  const date = new Date(time);
  return date.toLocaleString(); // Customize this format as per your requirement
};

const MapStoppagePoints = ({ points }) => {
  return points.map((point, index) => (
    <Marker key={index} position={[point.latitude, point.longitude]} icon={stoppageIcon}>
      <Popup>
        <div>
          <p>Stoppage Duration: {formatDuration(point.duration)}</p>
          <p>Time: {formatTime(point.fixTime)}</p>
        </div>
      </Popup>
    </Marker>
  ));
};

export default MapStoppagePoints;
