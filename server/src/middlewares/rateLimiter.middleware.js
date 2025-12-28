/**
 * Rate Limiting Middleware
 * Prevents API abuse for expensive operations like LLM calls
 */

const rateLimit = require("express-rate-limit");

/**
 * General API rate limiter
 * Applied to all API routes
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Strict rate limiter for LLM hint generation
 * More restrictive to manage API costs
 */
const hintLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 hint requests per minute
  message: {
    success: false,
    error:
      "Too many hint requests. Please wait a moment before requesting another hint.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all requests, even successful ones
});

/**
 * Moderate rate limiter for query execution
 * Prevents excessive database queries
 */
const queryLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 query executions per minute
  message: {
    success: false,
    error: "Too many query executions. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Workspace creation rate limiter
 * Prevents workspace spam
 */
const workspaceLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 workspace creations per hour
  message: {
    success: false,
    error: "Too many workspaces created. Please wait before creating more.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Table creation rate limiter
 */
const tableLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Limit each IP to 20 table creations per 5 minutes
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
