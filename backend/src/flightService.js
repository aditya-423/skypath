const { getAirports, getFlightsByOrigin } = require("./dataLoader");
const { toUTC, durationMinutes } = require("./utils");

const MIN_DOMESTIC = 45;
const MIN_INTL = 90;
const MAX_LAYOVER = 360;

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
    if (path.length > 3) return;

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

  const segments = path.map(f => {
    totalPrice += f.price;
    return {
      flightNumber: f.flightNumber,
      airline: f.airline,
      origin: f.origin,
      destination: f.destination,
      departureTime: f.departureTime,
      arrivalTime: f.arrivalTime,
      price: f.price,
    };
  });

  return {
    segments,
    totalPrice,
    totalDuration,
  };
}

module.exports = { searchFlights };