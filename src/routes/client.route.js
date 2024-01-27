require("dotenv").config();
const express = require("express");
const router = express.Router();
const {
  auth,
  check,
  confirmClientWithCode,
  sendConfirmationAgain,
  getSelf,
} = require("../controllers/client.controller");
const {
  checkAvailability,
  checkBan,
  checkRegistered,
  checkSelfAccess,
} = require("../middleware/client.middleware");

router.post("/login", auth);
router.get("/check/:oneId", check);
router.put("/confirm/:oneId", confirmClientWithCode);
router.put("/send-code-again/:oneId", sendConfirmationAgain);
router.get(
  "/get-self/:oneId",
  checkAvailability,
  checkRegistered,
  checkBan,
  checkSelfAccess,
  getSelf,
);

module.exports = router;
