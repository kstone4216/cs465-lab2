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
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      const title = window.prompt("Title for this location (e.g., 'Home' or 'Trip to Paris'):", "");
      if (title === null) return;
      const notes = window.prompt("Add details (years lived, fav spot, etc.):", "") ?? "";
      onAdd({ lat, lng, title: title.trim() || "Untitled", notes: notes.trim() });
    },
  });
  return null;
}

export default function App() {
  const [places, setPlaces] = useState([]);
  const [mode, setMode] = useState("collect");

  const handleAdd = ({ lat, lng, title, notes }) => {
    setPlaces((prev) => [...prev, { id: crypto.randomUUID(), lat, lng, title, notes }]);
  };

  const handleReset = () => {
    if (!confirm("Clear everything and start over?")) return;
    setPlaces([]);
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
<header style={{ display: "flex", gap: 8, padding: 10, borderBottom: "1px solid #eee" }}>
  <h2 style={{ margin: 0, flex: 1 }}>Oh, the places you've been!</h2>

  {/* Save/Load buttons are useful in both modes */}
  <button onClick={saveJSON}>Save JSON</button>
  <button onClick={saveCSV}>Save CSV</button>

  <label style={{ display: "inline-block" }}>
    <span style={{ padding: "6px 10px", border: "1px solid #ccc", borderRadius: 6, cursor: "pointer" }}>
      Load (JSON/CSV)
    </span>
    <input
      type="file"
      accept=".json,.csv"
      onChange={(e) => e.target.files[0] && loadFile(e.target.files[0])}
      style={{ display: "none" }}
    />
  </label>

  {mode === "collect" ? (
    <button onClick={() => setMode("done")}>Done</button>
  ) : (
    <button onClick={handleReset}>Reset</button>
  )}
</header>

// --- Save as JSON ---
const saveJSON = () => {
  const blob = new Blob([JSON.stringify(places, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "places.json";
  a.click();
  URL.revokeObjectURL(url);
};

// --- Save as CSV ---
const toCSV = (rows) => {
  // Ensure commas & quotes are handled
  const esc = (v = "") => `"${String(v).replace(/"/g, '""')}"`;
  const header = ["id", "lat", "lng", "title", "notes"];
  const lines = [header.join(",")].concat(
    rows.map((r) => [r.id, r.lat, r.lng, r.title, r.notes].map(esc).join(","))
  );
  return lines.join("\n");
};
const saveCSV = () => {
  const csv = toCSV(places);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "places.csv";
  a.click();
  URL.revokeObjectURL(url);
};

// --- Load from JSON or CSV (auto-detect by file extension) ---
const loadFile = (file) => {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      if (file.name.toLowerCase().endsWith(".json")) {
        const arr = JSON.parse(reader.result);
        if (!Array.isArray(arr)) throw new Error("JSON must be an array");
        const mapped = arr
          .filter((x) => typeof x.lat === "number" && typeof x.lng === "number")
          .map((x) => ({
            id: x.id || crypto.randomUUID(),
            lat: x.lat,
            lng: x.lng,
            title: x.title || "Untitled",
            notes: x.notes || "",
          }));
        setPlaces(mapped);
      } else if (file.name.toLowerCase().endsWith(".csv")) {
        // Very simple CSV parser: expects header id,lat,lng,title,notes (order matters)
        const text = String(reader.result);
        const [headerLine, ...lines] = text.split(/\r?\n/).filter(Boolean);
        const expected = "id,lat,lng,title,notes";
        if (headerLine.replace(/\s+/g, "") !== expected) {
          throw new Error(`CSV header must be exactly: ${expected}`);
        }
        const parseCSVRow = (line) => {
          // Split CSV respecting quotes; minimal parser
          const out = [];
          let cur = "";
          let inQ = false;
          for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"' ) {
              if (inQ && line[i+1] === '"') { cur += '"'; i++; }
              else inQ = !inQ;
            } else if (ch === "," && !inQ) {
              out.push(cur); cur = "";
            } else {
              cur += ch;
            }
          }
          out.push(cur);
          return out.map((s) => s.trim());
        };
        const parsed = lines.map(parseCSVRow).map(([id, lat, lng, title, notes]) => ({
          id: id || crypto.randomUUID(),
          lat: Number(lat),
          lng: Number(lng),
          title: title || "Untitled",
          notes: notes || "",
        })).filter((r) => Number.isFinite(r.lat) && Number.isFinite(r.lng));
        setPlaces(parsed);
      } else {
        throw new Error("Unsupported file type. Use .json or .csv");
      }
    } catch (e) {
      alert("Failed to load file: " + e.message);
    }
  };
  reader.readAsText(file);
};
