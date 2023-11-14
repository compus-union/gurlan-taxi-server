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
  deleteSelf,
  checkIfLoggedIn,
  restart,
} = require("../controllers/driver.controller");
const {
  checkRegister,
  checkLogin,
  checkImages,
  checkAvailability: driverAvailability,
  checkRegistered: driverRegistered,
  checkBan: driverBan,
} = require("../middleware/driver.middleware");

router.post("/register", checkRegister, register);
router.post("/login", driverRegistered, checkLogin, login);
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
router.get(
  "/check-logged-in/:oneId",
  driverAvailability,
  driverRegistered,
  driverBan,
  checkIfLoggedIn
);
router.delete("/restart/:oneId", driverAvailability, driverRegistered, restart);

router.delete("/delete-self/:oneId", deleteSelf);

module.exports = router;
