const toMin = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
const toStr = (m) => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');

// Builds the list of bookable slots for a facility, e.g. 06:00-07:00, 07:00-08:00 ...
function buildSlots(facility) {
  const step = facility.slotMinutes || 60;
  const out = [];
  for (let s = toMin(facility.openTime); s + step <= toMin(facility.closeTime); s += step) {
    out.push({ start: toStr(s), end: toStr(s + step) });
  }
  return out;
}

module.exports = { buildSlots };
