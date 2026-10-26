const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io = null;

// Every connected socket joins a room named after its user's id, so a
// controller can push an event to exactly one user — "this donor", "this
// requester" — via io.to(`user:${id}`).emit(...), without needing to
// track individual socket ids anywhere else in the app.
function userRoom(userId) {
  return `user:${userId}`;
}

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "*",
      credentials: true,
    },
  });

  // Authenticates the socket connection itself using the same JWT the
  // REST API uses — sent once at connection time (socket.handshake.auth.token),
  // not re-sent with every message. An unauthenticated or invalid token
  // rejects the connection outright rather than letting it connect and
  // fail later.
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token provided"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(userRoom(socket.userId));
    console.log(`Socket connected: user ${socket.userId} (${socket.userRole})`);

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: user ${socket.userId}`);
    });
  });

  return io;
}

// Returns null instead of throwing when Socket.IO hasn't been
// initialized (e.g. a test harness that boots the Express app directly
// without ever calling initSocket). Controllers check for null before
// emitting, so a missing socket server degrades to "no live push"
// rather than crashing the whole HTTP request.
function getIO() {
  return io;
}

module.exports = { initSocket, getIO, userRoom };