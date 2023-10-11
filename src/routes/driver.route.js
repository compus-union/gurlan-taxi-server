require("dotenv").config();
const express = require("express");
const { upload } = require("../uploads");
const router = express.Router();
const {
  register,
  login,
  sendImages,
  checkIfExists,
  checkIfValidated,
} = require("../controllers/driver.controller");
const {
  checkRegister,
  checkLogin,
  checkImages,
  checkAvailability: driverAvailability,
  checkRegistered: driverRegistered,
  checkBan: driverBan,
  checkApproved
} = require("../middleware/driver.middleware");

router.post("/register", checkRegister, register);
router.post("/login", checkLogin, checkApproved, login);
router.post(
  "/send-images/:oneId/:password",
  checkImages,
  upload.array("images"),
  sendImages
);
router.get(
  "/check/:oneId",
  driverAvailability,
  driverRegistered,
  driverBan,
  checkIfExists
);
router.get(
  "/check-validation/:oneId",
  driverAvailability,
  driverRegistered,
  driverBan,
  checkIfValidated
);

module.exports = router;
