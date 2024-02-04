// Imports
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

// Import default marker shadow image from Leaflet
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Define custom marker icons for visited and unvisited Waffle Houses
const visitedMarkerIcon = new L.Icon({
  iconUrl: process.env.PUBLIC_URL + '/blackmarker.png',
  shadowUrl: markerShadow,
  iconSize: [30, 30],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

const unvisitedMarkerIcon = new L.Icon({
  iconUrl: process.env.PUBLIC_URL + '/redmarker.png',
  shadowUrl: markerShadow,
  iconSize: [30, 30],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

const WaffleHouseListOverlay = ({ waffleHouses, selectedState, onCheckboxChange }) => (
  <div className="waffle-house-list-overlay">
    <h3>Waffle Houses in {selectedState || 'All States'}</h3>
    <ul>
      {waffleHouses
        .filter((wh) => !selectedState || wh.state === selectedState)
        .map((wh) => (
          <li key={wh.name}>
            <label className="checkbox-label">
              {wh.name}
              <input
                type="checkbox"
                checked={wh.visited}
                onChange={() => onCheckboxChange(wh.name)}
              />
              <span className="checkmark"></span>
            </label>
          </li>
        ))}
    </ul>
  </div>
);

function App() {
  // Variables for managing Waffle House data, menu state, and selected state filter
  const [waffleHouses, setWaffleHouses] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [userLocation, setUserLocation] = useState(null);

  //Fetch user location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    } else {
      console.warn('Geolocation is not supported by your browser.');
    }
  }, []);

  // Fetch Waffle House data from JSON
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/waffleHouseData.json');
        const data = await response.json();
        // Load visited status from local storage and update state
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

  // Toggle visited status when a checkbox is clicked
  const handleCheckboxChange = (name) => {
    setWaffleHouses((prevWaffleHouses) =>
      prevWaffleHouses.map((wh) =>
        wh.name === name ? { ...wh, visited: !wh.visited } : wh
      )
    );
  };

  // Handle state change when selecting a state from the dropdown
  const handleStateChange = (e) => {
    const newState = e.target.value;
    setSelectedState(newState);

    // Find the first Waffle House in the selected state
    const firstInState = waffleHouses.find((wh) => wh.state === newState);

    // If a Waffle House is found, set the map view to its location
    if (firstInState) {
      const { latitude, longitude } = firstInState;
      mapRef.current.setView([latitude, longitude], 7);
    }
  };

  // Save visited status to local storage when the state changes
  useEffect(() => {
    waffleHouses.forEach((wh) => {
      localStorage.setItem(wh.name, wh.visited);
    });
  }, [waffleHouses]);

  // Reference for the Leaflet MapContainer
  const mapRef = React.createRef();

  // Manage overlay visibility
  const [overlayVisible, setOverlayVisible] = useState(false);

  // Render JSX
  return (
    <div className="App">
      <button className="menu-toggle" onClick={() => { setMenuOpen(!menuOpen); setOverlayVisible(false); }}>
        ☰
      </button>
      <div className={`menu ${menuOpen ? 'menu-open' : ''}`}>
        <h2>Waffle House Tracker</h2>
        <div>
          <label htmlFor="stateFilter">Select State:</label>
          <select
            id="stateFilter"
            onChange={handleStateChange}
            value={selectedState}
          >
            <option value="">All States</option>
            {Array.from(new Set(waffleHouses.map((wh) => wh.state))).map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>
        <button onClick={() => setOverlayVisible(!overlayVisible)}>
          Toggle Waffle House List
        </button>
        {overlayVisible && (
          <WaffleHouseListOverlay
            waffleHouses={waffleHouses}
            selectedState={selectedState}
            onCheckboxChange={handleCheckboxChange}
          />
        )}
        {/* Waffle House list section */}
        <div className="waffle-house-list">
          <h3>Waffle Houses in {selectedState || 'All States'}</h3>
          <ul>
            {waffleHouses
              .filter((wh) => !selectedState || wh.state === selectedState)
              .map((wh) => (
                <li key={wh.name}>
                  <label className="checkbox-label">
                    {wh.name}
                    <input
                      type="checkbox"
                      checked={wh.visited}
                      onChange={() => handleCheckboxChange(wh.name)}
                    />
                    <span className="checkmark"></span>
                  </label>
                </li>
              ))}
          </ul>
        </div>
      </div>
      <MapContainer
        ref={mapRef}
        center={userLocation ? userLocation : [37.7749, -122.4194]}
        zoom={10}
        style={{ height: '100vh', width: '100vw' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {waffleHouses
          .filter((wh) => !selectedState || wh.state === selectedState)
          .map((wh, index) => (
            <Marker
              key={index}
              position={[wh.latitude, wh.longitude]}
              icon={wh.visited ? visitedMarkerIcon : unvisitedMarkerIcon}
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