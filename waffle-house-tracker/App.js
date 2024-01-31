import React, { useState } from 'react';
import Map from './Map';
import waffleHousesData from './waffleHousesData'; // dataset
import './App.css';

function App() {
  const [selectedWaffleHouse, setSelectedWaffleHouse] = useState(null);

  const handleMarkerClick = (waffleHouse) => {
    setSelectedWaffleHouse(waffleHouse);
  };

  return (
    <div className="App">
      <h1>Waffle House Tracker</h1>
      <Map waffleHouses={waffleHousesData} onMarkerClick={handleMarkerClick} />

      {selectedWaffleHouse && (
        <div>
          <h2>{selectedWaffleHouse.name}</h2>
          <p>Address: {selectedWaffleHouse.address}</p>
          {/* Add more details as needed */}
        </div>
      )}
    </div>
  );
}

export default App;
