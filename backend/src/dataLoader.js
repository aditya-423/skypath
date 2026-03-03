/**
 * Data Loader Module
 *
 * Responsible for:
 * - Reading flights.json
 * - Building airport map
 * - Grouping flights by origin for efficient lookup
 */

const fs = require("fs");
const path = require("path");

let airports = [];
let flights = [];
let flightsByOrigin = {};

// Loads flight and airport data into memory at server startup
function loadData() {
  const data = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../../flights.json"))
  );

  airports = data.airports;
  flights = data.flights;

  flightsByOrigin = {};

  for (const flight of flights) {
    if (!flightsByOrigin[flight.origin]) {
      flightsByOrigin[flight.origin] = [];
    }
    flightsByOrigin[flight.origin].push(flight);
  }
}

function getAirports() {
  return airports;
}

// Returns flights grouped by origin airport code
// Used for efficient DFS traversal
function getFlightsByOrigin() {
  return flightsByOrigin;
}

module.exports = { loadData, getAirports, getFlightsByOrigin };