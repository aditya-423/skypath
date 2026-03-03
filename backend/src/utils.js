/**
 * Utility functions for time calculations
 *
 * All flight times are stored in local airport time.
 * These helpers convert times to UTC for accurate duration computation.
 */

const { DateTime } = require("luxon");

// Converts local time (with timezone) into UTC DateTime
function toUTC(time, timezone) {
  return DateTime.fromISO(time, { zone: timezone }).toUTC();
}

// Computes difference in minutes between two UTC timestamps
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