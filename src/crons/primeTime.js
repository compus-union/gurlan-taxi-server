const express = require("express");
const app = express();
const cron = require("node-cron");

async function cronInitialize() {
  const enableSchedule = async (time) => {
    const fStartTime = time.startTime.reverse().join(" "); // [s, m, h]
    const startTimeFullPattern = `${fStartTime} * ${time.excMonth} ${time.excWeekDays}`;

    const cronJob = cron.schedule(
      startTimeFullPattern,
      () => {
        // Prime time is enabled
        console.log("Enable schedule worked");
      },
      { scheduled: false }
    );

    return { cronJob };
  };

  const disableSchedule = async (time) => {
    const fEndTime = time.finishTime.reverse().join(" "); // [s, m, h]

    const fEndTimeFullPattern = `${fEndTime} * ${time.excMonth} ${time.excWeekDays}`;

    const cronJob = cron.schedule(
      fEndTimeFullPattern,
      () => {
        // Prime time is disabled
        console.log("Disable schedule worked");
      },
      { scheduled: false }
    );

    return { cronJob };
  };

  return {
    enableSchedule,
    disableSchedule,
  };
}

module.exports = { cronInitialize };