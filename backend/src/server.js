/**
 * SkyPath Backend Server
 *
 * Exposes REST APIs for:
 * - Airport listing
 * - Flight search with connection rules
 *
 * Handles:
 * - Input validation
 * - Error handling
 * - CORS configuration
 */

const express = require("express");
const cors = require("cors");
const { loadData, getAirports } = require("./dataLoader");
const { searchFlights } = require("./flightService");

loadData();

const app = express();
app.use(cors());
app.use(express.json());

// Returns list of all airports (used by frontend for search inputs)
app.get("/airports", (req, res) => {
  const airports = getAirports();
  res.json(airports);
});

// Searches for valid flight itineraries based on origin, destination and date
// Applies connection rules in flightService
app.get("/search", (req, res) => {
  try {
    const { origin, destination, date } = req.query;

    if (!origin || !destination || !date) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    const results = searchFlights(
      origin.toUpperCase(),
      destination.toUpperCase(),
      date
    );

    res.json(results);
  } catch (err) {
    // Gracefully return error messages to frontend
    res.status(400).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("Backend running on port 3000");
});