import { io, Socket } from "socket.io-client";

// Only initialize the client socket in the browser.
// This prevents creating a socket connection during server-side rendering
// which can produce duplicate event handlers or unexpected behavior.
export const socket: Socket | null = typeof window !== "undefined" ? io("http://localhost:4000") : null;
