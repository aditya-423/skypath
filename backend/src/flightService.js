/**
 * Flight Search Service
 *
 * Implements DFS-based search to generate all valid itineraries
 * up to 3 segments, enforcing connection rules:
 *
 * - Minimum layover (domestic/international)
 * - Maximum layover
 * - No airport switching
 * - Timezone-aware duration calculation
 */

const { getAirports, getFlightsByOrigin } = require("./dataLoader");
const { toUTC, durationMinutes } = require("./utils");

// Connection rule thresholds (in minutes)
const MIN_DOMESTIC = 45;
const MIN_INTL = 90;
const MAX_LAYOVER = 360;

/**
 * Finds all valid itineraries between origin and destination.
 * Uses DFS to explore possible flight paths.
 * Returns results sorted by total travel duration.
 */
function searchFlights(origin, destination, date) {
  if (origin === destination) return [];

  const airports = getAirports();
  const flightsByOrigin = getFlightsByOrigin();

  const airportMap = Object.fromEntries(
    airports.map(a => [a.code, a])
  );

  if (!airportMap[origin] || !airportMap[destination]) {
    throw new Error("Invalid airport code");
  }

  const results = [];

  function dfs(currentAirport, path, visited) {
    if (path.length > 3) return; // Limit to maximum 3 flight segments to avoid excessive depth

    if (currentAirport === destination && path.length > 0) {
      results.push(buildItinerary(path, airportMap));
      return;
    }

    const possibleFlights = flightsByOrigin[currentAirport] || [];

    for (const flight of possibleFlights) {
      if (visited.has(flight.destination)) continue;

      if (path.length === 0) {
        if (!flight.departureTime.startsWith(date)) continue;
      } else {
        const lastFlight = path[path.length - 1];

        const arrivalAirport = airportMap[lastFlight.destination];
        const departureAirport = airportMap[flight.origin];

        const arrivalUTC = toUTC(
          lastFlight.arrivalTime,
          arrivalAirport.timezone
        );

        const departureUTC = toUTC(
          flight.departureTime,
          departureAirport.timezone
        );

        // Calculate layover time in UTC to ensure timezone correctness
        const layover = durationMinutes(arrivalUTC, departureUTC);

        const isDomestic =
          arrivalAirport.country === departureAirport.country;

        const minLayover = isDomestic
          ? MIN_DOMESTIC
          : MIN_INTL;

        if (layover < minLayover || layover > MAX_LAYOVER) continue;
      }

      dfs(
        flight.destination,
        [...path, flight],
        new Set([...visited, flight.destination])
      );
    }
  }

  dfs(origin, [], new Set([origin]));

  return results.sort((a, b) => a.totalDuration - b.totalDuration);
}

/**
 * Constructs itinerary object:
 * - Computes total duration (UTC-based)
 * - Computes total price
 * - Computes layover durations between segments
 */
function buildItinerary(path, airportMap) {
  let totalPrice = 0;

  const firstAirport = airportMap[path[0].origin];
  const lastAirport = airportMap[path[path.length - 1].destination];

  const firstDepartureUTC = toUTC(
    path[0].departureTime,
    firstAirport.timezone
  );

  const lastArrivalUTC = toUTC(
    path[path.length - 1].arrivalTime,
    lastAirport.timezone
  );

  const totalDuration = durationMinutes(
    firstDepartureUTC,
    lastArrivalUTC
  );

  const segments = path.map((f, index) => {
    totalPrice += f.price;

    let layover = null;

    if (index > 0) {
        const prevFlight = path[index - 1];

        const prevArrivalUTC = toUTC(
        prevFlight.arrivalTime,
        airportMap[prevFlight.destination].timezone
        );

        const currentDepartureUTC = toUTC(
        f.departureTime,
        airportMap[f.origin].timezone
        );

        layover = durationMinutes(prevArrivalUTC, currentDepartureUTC);
    }

    return {
      flightNumber: f.flightNumber,
      airline: f.airline,
      origin: f.origin,
      destination: f.destination,
      departureTime: f.departureTime,
      arrivalTime: f.arrivalTime,
      departureTimezone: airportMap[f.origin].timezone,
      arrivalTimezone: airportMap[f.destination].timezone,
      price: f.price,
      layover,
    };
  });

  return {
    segments,
    totalPrice,
    totalDuration,
  };
}

module.exports = { searchFlights };