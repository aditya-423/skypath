/**
 * SkyPath Frontend Application
 *
 * Features:
 * - Searchable airport inputs (typeahead)
 * - Date picker
 * - Flight results display
 * - Layover visualization
 * - Stops indicator
 * - Loading & error handling
 */

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

  const [originQuery, setOriginQuery] = useState("");
  const [destinationQuery, setDestinationQuery] = useState("");
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3000/airports")
      .then(res => res.json())
      .then(data => setAirports(data));
  }, []);

  const filteredOrigins = airports.filter(a =>
    a.code.toLowerCase().includes(originQuery.toLowerCase())
  );

  const filteredDestinations = airports.filter(a =>
    a.code.toLowerCase().includes(destinationQuery.toLowerCase())
  );

  // Handles flight search request and manages loading & error states
  const search = async () => {
    setError("");
    setResults([]);

    if (!origin || !destination || !date) {
      setError("Please select valid origin, destination and date.");
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

          {/* Searchable origin input with live filtering dropdown */}
          {/* ORIGIN INPUT */} 
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter Origin (e.g. JFK)"
              value={originQuery}
              onChange={(e) => {
                const value = e.target.value.toUpperCase();
                setOriginQuery(value);
                setOrigin("");
                setShowOriginDropdown(true);
              }}
              onFocus={() => setShowOriginDropdown(true)}
            />

            {showOriginDropdown && originQuery && (
              <div className="dropdown">
                {filteredOrigins.length > 0 ? (
                  filteredOrigins.map(a => (
                    <div
                      key={a.code}
                      className="dropdown-item"
                      onClick={() => {
                        setOrigin(a.code);
                        setOriginQuery(a.code);
                        setShowOriginDropdown(false);
                      }}
                    >
                      {a.name} ({a.code})
                    </div>
                  ))
                ) : (
                  <div className="dropdown-item">No matches</div>
                )}
              </div>
            )}
          </div>

          {/* DESTINATION INPUT  - Searchable dest input with live filtering dropdown*/}
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter Destination (e.g. LAX)"
              value={destinationQuery}
              onChange={(e) => {
                const value = e.target.value.toUpperCase();
                setDestinationQuery(value);
                setDestination("");
                setShowDestinationDropdown(true);
              }}
              onFocus={() => setShowDestinationDropdown(true)}
            />

            {showDestinationDropdown && destinationQuery && (
              <div className="dropdown">
                {filteredDestinations.length > 0 ? (
                  filteredDestinations.map(a => (
                    <div
                      key={a.code}
                      className="dropdown-item"
                      onClick={() => {
                        setDestination(a.code);
                        setDestinationQuery(a.code);
                        setShowDestinationDropdown(false);
                      }}
                    >
                      {a.name} ({a.code})
                    </div>
                  ))
                ) : (
                  <div className="dropdown-item">No matches</div>
                )}
              </div>
            )}
          </div>

          {/* DATE */}
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />

          <button onClick={search} disabled={loading}>
            {loading ? "Searching..." : "Search Flights"}
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        <div className="results">
          {!loading && results.length === 0 && !error && date && (
            <p className="empty">No flights found for this route.</p>
          )}
          {/* Render itineraries sorted by total duration */}
          {results.map((itinerary, i) => {
            const stops = itinerary.segments.length - 1;

            return (
              <div key={i} className="itinerary-card">
                <div className="summary">
                  <div>
                    <h3>{formatDuration(itinerary.totalDuration)}</h3>
                    <span>Total Duration</span>
                  </div>

                  <div>
                    <h3>
                      {stops === 0
                        ? "Non-stop"
                        : `${stops} Stop${stops > 1 ? "s" : ""}`}
                    </h3>
                    <span>Stops</span>
                  </div>

                  <div>
                    <h3>${itinerary.totalPrice}</h3>
                    <span>Total Price</span>
                  </div>
                </div>

                <div className="segments">
                  {itinerary.segments.map((seg, j) => (
                    <div key={j}>
                      {seg.layover && (
                        <div className="layover">
                          Layover: {Math.floor(seg.layover / 60)}h {seg.layover % 60}m
                        </div>
                        // Display layover time between connecting flights
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
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;