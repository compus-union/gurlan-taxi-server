require("dotenv").config();
const express = require("express");
const router = express.Router();
const {
  auth,
  check,
  confirmClientWithCode,
  sendConfirmationAgain,
} = require("../controllers/client.controller");

router.post("/login", auth);
router.get("/check/:oneId", check);
router.put("/confirm/:oneId", confirmClientWithCode);
router.put("/send-code-again/:oneId", sendConfirmationAgain);

module.exports = router;
