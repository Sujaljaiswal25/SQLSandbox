const express = require("express");
const router = express.Router();
const { generateHint } = require("../controllers/hint.controller");

// Generate AI hint for query writing
router.post("/hint", generateHint);

module.exports = router;
