const express = require("express");
const router = express.Router();

// Import controller
const {
  generateHint,
  explainError,
} = require("../controllers/hint.controller");

// Import rate limiter
const { hintLimiter } = require("../middlewares/rateLimiter.middleware");

// ============================================
// AI HINT ROUTES
// ============================================

// Get AI-powered SQL hint (educational, not complete solution)
// Powered by Google Gemini
router.post("/hint", hintLimiter, generateHint);

// Get explanation for SQL error
router.post("/hint/explain-error", hintLimiter, explainError);

module.exports = router;
