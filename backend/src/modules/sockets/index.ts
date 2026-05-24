import { Server } from "socket.io";
import { corsOrigins } from "../../config/env";
import { setSocketServer } from "./socket.service";
import { registerCustomerNamespace } from "./customer.socket";
import { registerDriverNamespace } from "./driver.socket";

export function configureSockets(io: Server) {
  io.engine.on("connection_error", (err) => {
    console.warn("Socket connection error", err.message);
  });

  setSocketServer(io);
  registerCustomerNamespace(io);
  registerDriverNamespace(io);
  void corsOrigins;
}
