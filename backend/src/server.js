require("dotenv").config();
const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const { initSocket } = require("./socket");

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();

  // Express and Socket.IO share the same underlying HTTP server, so
  // both the REST API and the WebSocket connections are served from one
  // process on one port — no separate server or port needed.
  const httpServer = http.createServer(app);
  initSocket(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`ReliefNet API + WebSocket server listening on http://localhost:${PORT}`);
  });
}

start();