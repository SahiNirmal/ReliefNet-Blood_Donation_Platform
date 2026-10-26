const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verifies the Authorization: Bearer <token> header, and attaches the
// real user document to req.user. Every route that trusts "who is
// making this request" reads req.user from here — never from anything
// the client sent in the request body, which is trivially spoofable
// (before this experiment, a donor's own _id was just a plain body
// field, so anyone could impersonate any donor by passing their id).
async function protect(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized — no token provided." });
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Not authorized — user no longer exists." });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized — invalid or expired token." });
  }
}

// Use after protect(): restricts a route to specific roles, e.g.
// authorize("requester") on the create-request route so a donor account
// can't post emergency requests even with a perfectly valid token.
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `This action requires role: ${roles.join(" or ")}.` });
    }
    next();
  };
}

module.exports = { protect, authorize };