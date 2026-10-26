const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");

const userRoutes = require("./routes/userRoutes");
const requestRoutes = require("./routes/requestRoutes");
const donationRoutes = require("./routes/donationRoutes");
const statsRoutes = require("./routes/statsRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const sanitizeInputs = require("./middleware/sanitizeInputs");
const { generalLimiter, authLimiter } = require("./middleware/rateLimiters");

const app = express();

// Sets a set of protective HTTP response headers (X-Content-Type-Options,
// X-Frame-Options, a conservative Content-Security-Policy, etc.) that
// guard against a range of common browser-side attacks.
app.use(helmet());

// CORS is restricted to a single configured origin — the deployed
// frontend — rather than left open to any site (cors()'s default). Falls
// back to allowing all origins only if FRONTEND_URL isn't set, so local
// development without a .env doesn't break; production deployments
// should always set FRONTEND_URL.
const allowedOrigin = process.env.FRONTEND_URL;
app.use(
  cors({
    origin: allowedOrigin || true,
    credentials: true,
  })
);

// A request body over 10kb has no legitimate reason to hit this API and
// is rejected before it's even parsed — a cheap guard against
// oversized-payload abuse.
app.use(express.json({ limit: "10kb" }));

// Strips any request key that looks like a MongoDB operator (starts with
// "$") or contains a "." — the classic NoSQL-injection vectors, e.g. a
// login payload of { email: { "$gt": "" }, password: { "$gt": "" } }
// that would otherwise match every user. Also collapses HTTP Parameter
// Pollution in query strings (?bloodGroup=O+&bloodGroup=A+). See the
// file itself for why this is a small custom implementation rather than
// the usual express-mongo-sanitize + hpp libraries.
app.use(sanitizeInputs);

app.use(morgan("dev"));

// The general limiter applies everywhere; the stricter authLimiter is
// layered on top for just the two endpoints a brute-force attack would
// actually target.
app.use("/api", generalLimiter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "ReliefNet API" });
});

app.use("/api/users/register", authLimiter);
app.use("/api/users/login", authLimiter);
app.use("/api/users/forgot-password", authLimiter);
app.use("/api/users/reset-password", authLimiter);

app.use("/api/users", userRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/stats", statsRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
