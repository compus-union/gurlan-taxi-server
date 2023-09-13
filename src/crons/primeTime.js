const express = require("express");
const cron = require("node-cron");
const { PrismaClient } = require("@prisma/client");
const {mainEvent} = require("../events")

const prisma = new PrismaClient();

async function cronInitialize() {
  const enableSchedule = async (time) => {
    const fStartTime = time.startTime.reverse().join(" "); // [s, m, h]
    const startTimeFullPattern = `${fStartTime} * ${time.excMonth} ${time.excWeekDays}`;

    console.log(startTimeFullPattern);

    const cronJob = cron.schedule(
      startTimeFullPattern,
      async () => {
        // Prime time is enabled
        const updatedEnabledTime = await prisma.primeTime.update({
          where: { id: time.id },
          data: { status: "ENABLED" },
        });

        console.log("Enable schedule worked: ", updatedEnabledTime.status);
      },
      { scheduled: false }
    );

    return { cronJob };
  };

  const disableSchedule = async (time) => {
    const fEndTime = time.finishTime.reverse().join(" "); // [s, m, h]
    const endTimeFullPattern = `${fEndTime} * ${time.excMonth} ${time.excWeekDays}`;

    console.log(endTimeFullPattern);

    const cronJob = cron.schedule(
      endTimeFullPattern,
      async () => {
        // Prime time is disabled
        const updatedEnabledTime = await prisma.primeTime.update({
          where: { id: time.id },
          data: { status: "DISABLED" },
        });

        console.log("Disable schedule worked: ", updatedEnabledTime.status);
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
