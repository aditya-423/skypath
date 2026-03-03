const { DateTime } = require("luxon");

function toUTC(time, timezone) {
  return DateTime.fromISO(time, { zone: timezone }).toUTC();
}

function durationMinutes(startUTC, endUTC) {
  return endUTC.diff(startUTC, "minutes").minutes;
}

function formatDuration(minutes) {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}h ${mins}m`;
}

module.exports = {
  toUTC,
  durationMinutes,
  formatDuration,
};