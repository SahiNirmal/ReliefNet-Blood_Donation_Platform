const rateLimit = require("express-rate-limit");

// Applied to every /api route. Generous enough not to bother a normal
// user browsing the app, but stops a single client from hammering the
// API (accidentally via a bug, or deliberately).
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again in a few minutes." },
});

// Applied only to register/login. Much stricter, since these are the
// endpoints a brute-force or credential-stuffing attack would target —
// repeatedly guessing passwords, or spamming account creation.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please wait a few minutes before trying again." },
});

module.exports = { generalLimiter, authLimiter };
