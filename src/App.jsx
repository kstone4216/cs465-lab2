import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icons for bundlers (Vite/CRA)
import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
L.Icon.Default.mergeOptions({ iconRetinaUrl: marker2x, iconUrl: marker, shadowUrl: markerShadow });

const DEFAULT_CENTER = [39.8283, -98.5795]; // USA

function ClickToAdd({ onAdd }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      const title = window.prompt("Title for this location (e.g., 'Home' or 'Trip to Paris'):", "");
      if (title === null) return; // cancel
      const notes = window.prompt("Add details (years lived, fav spot, etc.):", "") ?? "";
      onAdd({ lat, lng, title: title.trim() || "Untitled", notes: notes.trim() });
    },
  });
  return null;
}

export default function App() {
  const [places, setPlaces] = useState([]); // {id, lat, lng, title, notes}
  const [mode, setMode] = useState("collect"); // "collect" | "done"

  const handleAdd = ({ lat, lng, title, notes }) => {
    setPlaces((prev) => [...prev, { id: crypto.randomUUID(), lat, lng, title, notes }]);
  };

  const handleReset = () => {
    if (!confirm("Clear everything and start over?")) return;
    setPlaces([]);
    setMode("collect");
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ display: "flex", gap: 8, padding: 10, borderBottom: "1px solid #eee" }}>
        <h2 style={{ margin: 0, flex: 1 }}>Oh, the places you've been!</h2>
        {mode === "collect" ? (
          <button onClick={() => setMode("done")}>Done</button>
        ) : (
          <button onClick={handleReset}>Reset</button>
        )}
      </header>

      <div style={{ padding: 10 }}>
        <MapContainer center={DEFAULT_CENTER} zoom={4} style={{ height: "70vh", borderRadius: 12 }}>
          <TileLayer
            // OpenStreetMap tiles (free, no key)
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {mode === "collect" && <ClickToAdd onAdd={handleAdd} />}

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
          <div style={{ marginTop: 10 }}>
            <h3 style={{ margin: "12px 0" }}>Places</h3>
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

      <footer style={{ marginTop: "auto", padding: 10, textAlign: "center", color: "#666" }}>
        Map data © OpenStreetMap contributors • Built with Leaflet
      </footer>
    </div>
  );
}
