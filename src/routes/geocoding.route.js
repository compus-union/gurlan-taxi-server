require("dotenv").config();
const express = require("express");
const router = express.Router();
const {
  searchPlace,
} = require("../controllers/geocoding/geocoding.controller");

router.get("/search/:oneId/:place", searchPlace);

module.exports = router;
