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
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/airports")
      .then(res => res.json())
      .then(data => setAirports(data));
  }, []);

  const search = async () => {
    setError("");
    setResults([]);

    // Input validation
    if (!origin || !destination || !date) {
      setError("Please select origin, destination and date.");
      return;
    }

    if (origin === destination) {
      setError("Origin and destination cannot be the same.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `http://localhost:3000/search?origin=${origin}&destination=${destination}&date=${date}`
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Something went wrong.");
      }

      const data = await res.json();
      setResults(data);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
            disabled={loading}
          >
            {loading ? "Searching..." : "Search Flights"}
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        <div className="results">
          {!loading && results.length === 0 && !error && date && (
            <p className="empty">No flights found for this route.</p>
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
                  <div key={j}>
                    
                    {/* Show layover BEFORE this segment if it exists */}
                    {seg.layover && (
                      <div className="layover">
                        Layover: {Math.floor(seg.layover / 60)}h {seg.layover % 60}m
                      </div>
                    )}

                    <div className="segment">
                      <div className="segment-left">
                        <strong>{seg.flightNumber}</strong>
                        <p>{seg.origin} → {seg.destination}</p>
                      </div>

                      <div className="segment-right">
                        <p>{seg.departureTime.slice(11, 16)} ({seg.origin})</p>
                        <p>{seg.arrivalTime.slice(11, 16)} ({seg.destination})</p>
                      </div>
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