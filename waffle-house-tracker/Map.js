import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

const Map = ({ waffleHouses, onMarkerClick }) => {
  return (
    <MapContainer
      center={[37.7749, -122.4194]} // Default to San Francisco coordinates
      zoom={10}
      style={{ height: '500px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {waffleHouses.map((wh, index) => (
        <Marker key={index} position={[wh.latitude, wh.longitude]} onClick={() => onMarkerClick(wh)}>
          <Popup>{wh.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;
