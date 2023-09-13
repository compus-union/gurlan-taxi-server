const express = require("express");
const router = express.Router();
const { createPrimeTime } = require("../controllers/primeTime.controller");
const {
  checkAvailability,
  checkRegistered,
  checkAdmin,
  checkBan,
  checkSuperAdmin,
} = require("../middleware/admin.middleware");

router.post(
  "/create",
  //   checkAvailability,
  //   checkRegistered,
  //   checkAdmin,
  //   checkBan,
  //   checkSuperAdmin,
  createPrimeTime
);

module.exports = router;
