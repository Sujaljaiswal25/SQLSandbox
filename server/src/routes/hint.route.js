const express = require("express");
const router = express.Router();
const {
  generateHint,
  explainError,
} = require("../controllers/hint.controller");
const { hintLimiter } = require("../middlewares/rateLimiter.middleware");

// Apply rate limiting to hint endpoints
router.post("/hint", hintLimiter, generateHint);
router.post("/hint/explain-error", hintLimiter, explainError);

module.exports = router;
