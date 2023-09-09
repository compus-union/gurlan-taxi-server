const express = require("express");
const app = express();
const cron = require("node-cron");

/**
 * app.locals = {
 *   schoolTime: {
 *      status: "enabled" | "disabled",
 *      startTime: "06:00",
 *      finishTime: "07:59"
 *  }
 * }
 */

async function enableSchoolTime() {
  const cronInit = cron.schedule("0 6 * 9-5 1-6", () => {
    console.log("Schedule worked");
  });

  cronInit.start();
}

enableSchoolTime()