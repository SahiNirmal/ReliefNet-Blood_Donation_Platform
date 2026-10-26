import { io } from "socket.io-client";

// The API base URL includes a /api suffix (e.g. http://localhost:5000/api)
// but Socket.IO connects to the server root, not a REST path — strip it.
const SOCKET_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

let socket = null;
let currentToken = null;

// A singleton rather than a new connection per component: every part of
// the app that cares about live events shares the one WebSocket.
//
// The existing socket is reused even while it is still connecting. In
// development React runs every effect twice (StrictMode), and checking
// `socket.connected` instead made the second call open a duplicate
// connection, leaving an orphaned one behind. A different token means a
// different user, so that case closes the old socket and starts fresh.
export function connectSocket(token) {
  if (socket && currentToken === token) return socket;

  if (socket) socket.disconnect();

  currentToken = token;
  const s = io(SOCKET_URL, { auth: { token }, reconnection: true });
  socket = s;

  // Visible in the browser console (F12) so "why am I not getting live
  // updates?" has a quick first answer.
  s.on("connect", () => console.info("[socket] connected"));
  s.on("connect_error", (err) => console.warn("[socket] could not connect:", err.message));
  s.on("disconnect", (reason) => console.info("[socket] disconnected:", reason));

  return s;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentToken = null;
  }
}

export function getSocket() {
  return socket;
}