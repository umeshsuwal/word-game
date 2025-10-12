import { io, Socket } from "socket.io-client";

// Only initialize the client socket in the browser and connect to same origin.
// Using the same origin lets Next + Socket.IO run from a single server.
const socketUrl = (process.env.NEXT_PUBLIC_SOCKET_URL as string) || "http://localhost:4000";

export const socket: Socket | null =
	typeof window !== "undefined" ? io(socketUrl) : null;
