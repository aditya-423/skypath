import { useEffect, useState } from "react";
import "./App.css";

function formatDuration(minutes) {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}h ${mins}m`;
}

function App() {
  const [airports, setAirports] = useState([]);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3000/airports")
      .then(res => res.json())
      .then(data => setAirports(data));
  }, []);

  const search = async () => {
    if (!origin || !destination || !date) return;

    setLoading(true);
    setResults([]);

    const res = await fetch(
      `http://localhost:3000/search?origin=${origin}&destination=${destination}&date=${date}`
    );

    const data = await res.json();
    setResults(data);
    setLoading(false);
  };

  return (
    <div className="page">
      <div className="container">
        <h1 className="logo">✈ SkyPath</h1>
        <p className="subtitle">Find the best flight connections worldwide</p>

        <div className="search-card">
          <select value={origin} onChange={e => setOrigin(e.target.value)}>
            <option value="">Select Origin</option>
            {airports.map(a => (
              <option key={a.code} value={a.code}>
                {a.name} ({a.code})
              </option>
            ))}
          </select>

          <select value={destination} onChange={e => setDestination(e.target.value)}>
            <option value="">Select Destination</option>
            {airports.map(a => (
              <option key={a.code} value={a.code}>
                {a.name} ({a.code})
              </option>
            ))}
          </select>

          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />

          <button
            onClick={search}
            disabled={!origin || !destination || !date}
          >
            {loading ? "Searching..." : "Search Flights"}
          </button>
        </div>

        <div className="results">
          {!loading && results.length === 0 && date && (
            <p className="empty">No flights found.</p>
          )}

          {results.map((itinerary, i) => (
            <div key={i} className="itinerary-card">
              <div className="summary">
                <div>
                  <h3>{formatDuration(itinerary.totalDuration)}</h3>
                  <span>Total Duration</span>
                </div>

                <div>
                  <h3>${itinerary.totalPrice}</h3>
                  <span>Total Price</span>
                </div>
              </div>

              <div className="segments">
                {itinerary.segments.map((seg, j) => (
                  <div key={j} className="segment">
                    <div className="segment-left">
                      <strong>{seg.flightNumber}</strong>
                      <p>{seg.origin} → {seg.destination}</p>
                    </div>
                    <div className="segment-right">
                      <p>{seg.departureTime.slice(11,16)}</p>
                      <p>{seg.arrivalTime.slice(11,16)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;