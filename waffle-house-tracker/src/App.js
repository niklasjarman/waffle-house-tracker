import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const customMarkerIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

function App() {
  const [waffleHouses, setWaffleHouses] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/waffleHouseData.json');
        const data = await response.json();
        // Load visited status from local storage
        const waffleHousesWithVisited = data.map((wh) => ({
          ...wh,
          visited: localStorage.getItem(wh.name) === 'true',
        }));
        setWaffleHouses(waffleHousesWithVisited);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleCheckboxChange = (name) => {
    // Toggle visited status in state
    setWaffleHouses((prevWaffleHouses) =>
      prevWaffleHouses.map((wh) =>
        wh.name === name ? { ...wh, visited: !wh.visited } : wh
      )
    );
  };

  // Save visited status to local storage when the state changes
  useEffect(() => {
    waffleHouses.forEach((wh) => {
      localStorage.setItem(wh.name, wh.visited);
    });
  }, [waffleHouses]);

  return (
    <div className="App">
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </button>
      <div className={`menu ${menuOpen ? 'menu-open' : ''}`}>
        <h2>Menu</h2>
        {/* Add additional menu items or links as needed */}
        <p>Option 1</p>
        <p>Option 2</p>
      </div>
      <MapContainer
        center={[37.7749, -122.4194]}
        zoom={10}
        style={{ height: '100vh', width: '100vw' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {waffleHouses.map((wh, index) => (
          <Marker
            key={index}
            position={[wh.latitude, wh.longitude]}
            icon={customMarkerIcon}
          >
            <Popup>
              <div className="popup-content">
                <h3>{wh.name}</h3>
                <p>{wh.address}</p>
                <p>
                  {wh.city}, {wh.state} {wh.zip_code}
                </p>
                <label className="checkbox-label">
                  Visited
                  <input
                    type="checkbox"
                    checked={wh.visited}
                    onChange={() => handleCheckboxChange(wh.name)}
                  />
                  <span className="checkmark"></span>
                </label>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default App;
