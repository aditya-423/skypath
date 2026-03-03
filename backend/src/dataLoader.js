const fs = require("fs");
const path = require("path");

let airports = [];
let flights = [];
let flightsByOrigin = {};

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

function getFlightsByOrigin() {
  return flightsByOrigin;
}

module.exports = { loadData, getAirports, getFlightsByOrigin };