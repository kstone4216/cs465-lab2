import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css"; 
import L from "leaflet";

// Markers that came from leaflet 
import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
L.Icon.Default.mergeOptions({ iconRetinaUrl: marker2x, iconUrl: marker, shadowUrl: markerShadow });

const DEFAULT_CENTER = [39.8283, -98.5795];

function ClickToAdd({ onAdd }) {
  useMapEvents({ //Use map events to handle clicking 
    click(e) {
      const { lat, lng } = e.latlng;  // plots latitude and longitude 
      const title = window.prompt("Title for this location (e.g., 'Home' or 'Trip to Paris'):", "");
      if (title === null) return; //If nothing entered return
      const notes = window.prompt("Add details (years lived, fav spot, etc.):", "") ?? "";
      onAdd({ lat, lng, title: title.trim() || "Untitled", notes: notes.trim() });
    },
  });
  return null;
}

export default function App() {
  const [places, setPlaces] = useState([]); // places contains array of data when adding location (id lat lng title)
  const [mode, setMode] = useState("collect"); // Collect list for adding locations

  const handleAdd = ({ lat, lng, title, notes }) => {
    setPlaces((prev) => [...prev, { id: crypto.randomUUID(), lat, lng, title, notes }]);
  };

  const handleReset = () => {
    if (!confirm("Clear everything and start over?")) return;
    setPlaces([]); // Clears this array 
    setMode("collect"); 
  };

  return (
    <div className="page">
      <header className="header"> 
        <h2>Oh, the places you've been!</h2> 
        {mode === "collect" ? ( 
          <button onClick={() => setMode("done")}>Done</button>  
        ) : (
          <button onClick={handleReset}>Reset</button>
        )}
      </header>

      <div className="main"> 
        <MapContainer center={DEFAULT_CENTER} zoom={4} className="map">  
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {mode === "collect" && <ClickToAdd onAdd={handleAdd} />} //d sdadasdas

          {places.map((p) => (
            <Marker key={p.id} position={[p.lat, p.lng]}>
              <Popup>
                <strong>{p.title}</strong>
                {p.notes ? <p style={{ marginTop: 8 }}>{p.notes}</p> : null}
              </Popup>
            </Marker>
          ))}
        </MapContainer> 

        {mode === "collect" && (
          <div className="places"> 
            <h3>Places</h3>
            {places.length === 0 ? ( 
              <em>Click the map to add your first place.</em>
            ) : (
              <ul>
                {places.map((p) => (
                  <li key={p.id}>
                    <strong>{p.title}</strong> — {p.notes || "No details"}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div> 

      <footer className="footer">
        Map data © OpenStreetMap contributors • Built with Leaflet 
      </footer>
    </div>
  );
}



