async function secondsToHms(d) {
  d = Number(d);
  const h = Math.floor(d / 3600);
  const m = Math.floor((d % 3600) / 60);
  const s = Math.floor((d % 3600) % 60);

  const hDisplay = h > 0 ? h + (h == 1 ? " soat, " : " soat, ") : "";
  const mDisplay = m > 0 ? m + (m == 1 ? " daqiqa, " : " daqiqa, ") : "";
  const sDisplay = s > 0 ? s + (s == 1 ? " soniya" : " soniya") : "";
  return {
    full: hDisplay + mDisplay + sDisplay,
    minutes: mDisplay.trimEnd(),
    hours: hDisplay.trimEnd(),
    seconds: sDisplay.trimEnd(),
  };
}

module.exports = { secondsToHms };
