import { Server } from "socket.io";

let ioRef: Server | null = null;

export function setSocketServer(io: Server) {
  ioRef = io;
}

export function getSocketServer() {
  if (!ioRef) throw new Error("Socket server has not been initialized");
  return ioRef;
}
