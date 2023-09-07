require("dotenv").config();
const express = require("express");
const router = express.Router();
const {
  searchPlace,
} = require("../controllers/geocoding.controller");
const {
  checkSelfAccess,
  checkRegistered,
  checkBan,
  checkAvailability,
} = require("../middleware/client.middleware");

router.get(
  "/search/:oneId/:place",
  checkAvailability,
  checkRegistered,
  checkBan,
  checkSelfAccess,
  searchPlace
);

module.exports = router;
