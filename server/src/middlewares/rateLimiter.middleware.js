// Rate limiting middleware - prevents API abuse

const rateLimit = require("express-rate-limit");

// General API limiter: 100 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Hint limiter: 10 requests per minute (strict to manage LLM API costs)
const hintLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    error:
      "Too many hint requests. Please wait a moment before requesting another hint.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

// Query limiter: 30 requests per minute
const queryLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    success: false,
    error: "Too many query executions. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Workspace limiter: 10 workspaces per hour
const workspaceLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: "Too many workspaces created. Please wait before creating more.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Table limiter: 20 tables per 5 minutes
const tableLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: "Too many tables created. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  hintLimiter,
  queryLimiter,
  workspaceLimiter,
  tableLimiter,
};
