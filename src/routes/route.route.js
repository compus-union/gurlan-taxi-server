const router = require("express").Router();
const { calculateRoute } = require("../controllers/route.controller");

router.put("/calculate/:id", calculateRoute);

module.exports = router