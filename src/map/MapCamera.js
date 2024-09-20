import { useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import { map } from './core/MapView';

const MapCamera = ({ positions, index, latitude, longitude, coordinates, replayMode }) => {
  useEffect(() => {
    if(!replayMode){
      map.setZoom(10);
    }
    if (replayMode) {
      // Follow vehicle marker in replay mode
      if (positions.length > 0 && index < positions.length) {
        const { latitude, longitude } = positions[index];
        
        map.flyTo({
          center: [longitude, latitude],
          zoom: Math.max(map.getZoom(), 16),
          speed: 2,
          curve: 1.42,
          easing: (t) => t,
        });
      }
    } else if (coordinates || positions) {
      // Existing logic for other use cases
      if (!coordinates) {
        coordinates = positions.map((item) => [item.longitude, item.latitude]);
      }
      if (coordinates.length) {
        const bounds = coordinates.reduce((bounds, item) => bounds.extend(item), new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));
        const canvas = map.getCanvas();
        map.fitBounds(bounds, {
          padding: Math.min(canvas.width, canvas.height) * 0.1,
          duration: 1000,
        });
      }
    } else {
      map.flyTo({
        center: [longitude, latitude],
        zoom: Math.max(map.getZoom(), 16),
      });
    }
  }, [latitude, longitude, positions, coordinates, index, replayMode]);

  return null;
};

export default MapCamera;
