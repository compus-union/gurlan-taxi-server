require("dotenv").config();
const express = require("express");
const router = express.Router();
const {
  auth,
  check,
  confirmClientWithCode,
  sendConfirmationAgain,
  getSelf,
  getAccount,
  updateAccount,
  deleteAccount,
  updatePersonalInfo,
  getBonus,
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
  getSelf
);
router.get(
  "/get-account/:oneId",
  checkAvailability,
  checkRegistered,
  checkBan,
  checkSelfAccess,
  getAccount
);
router.put(
  "/update/:oneId",
  checkAvailability,
  checkRegistered,
  checkBan,
  checkSelfAccess,
  updateAccount
);
router.delete(
  "/delete/:oneId",
  checkAvailability,
  checkRegistered,
  checkBan,
  checkSelfAccess,
  deleteAccount
);
router.put(
  "/update-personal-info/:oneId",
  checkAvailability,
  checkRegistered,
  checkBan,
  checkSelfAccess,
  updatePersonalInfo
);
router.get(
  "/get-bonus/:oneId",
  checkAvailability,
  checkRegistered,
  checkBan,
  checkSelfAccess,
  getBonus
);

module.exports = router;
