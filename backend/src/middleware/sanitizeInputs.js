// A minimal stand-in for express-mongo-sanitize: that package is
// incompatible with Express 5, and for a subtler reason than a simple
// crash. req.query in Express 5 isn't just read-only — it's a getter
// that recomputes a brand-new object from the raw query string on
// EVERY access. So even mutating req.query's keys in place (which
// avoids the "Cannot set property" crash) is silently discarded: the
// next time any code reads req.query, Express hands back a fresh,
// un-sanitized object, not the one that was just cleaned.
//
// The actual fix is to replace the getter on this one request object
// with a fixed, already-sanitized value via Object.defineProperty —
// after that, every subsequent access on this request returns the same
// sanitized object instead of re-parsing the URL each time.
function stripDangerousKeys(value) {
  if (Array.isArray(value)) {
    value.forEach(stripDangerousKeys);
    return;
  }
  if (value && typeof value === "object") {
    for (const key of Object.keys(value)) {
      if (key.startsWith("$") || key.includes(".")) {
        delete value[key];
      } else {
        stripDangerousKeys(value[key]);
      }
    }
  }
}

function sanitizeInputs(req, res, next) {
  // req.body and req.params are plain writable properties in Express 5,
  // so in-place mutation is enough for these two.
  stripDangerousKeys(req.body);
  stripDangerousKeys(req.params);

  // req.query needs the defineProperty workaround described above.
  // Also collapses HTTP Parameter Pollution here (e.g. a repeated
  // ?bloodGroup=O+&bloodGroup=A+ arriving as an array) down to the last
  // value, the same behavior the "hpp" package provides — folded in here
  // rather than added as a separate dependency, since hpp has this exact
  // same getter-recompute blind spot on req.query in Express 5 and would
  // silently do nothing.
  const sanitizedQuery = JSON.parse(JSON.stringify(req.query || {}));
  stripDangerousKeys(sanitizedQuery);
  for (const key of Object.keys(sanitizedQuery)) {
    if (Array.isArray(sanitizedQuery[key])) {
      sanitizedQuery[key] = sanitizedQuery[key][sanitizedQuery[key].length - 1];
    }
  }
  Object.defineProperty(req, "query", {
    value: sanitizedQuery,
    writable: true,
    configurable: true,
    enumerable: true,
  });

  next();
}

module.exports = sanitizeInputs;
