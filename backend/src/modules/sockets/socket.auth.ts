import { Socket } from "socket.io";
import { UserRole } from "@cab/shared";
import { verifyAccessToken } from "../../utils/tokens";

export function socketAuth(requiredRole: UserRole) {
  return (socket: Socket, next: (err?: Error) => void) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.toString().replace("Bearer ", "");
      if (!token) return next(new Error("Missing socket token"));
      const payload = verifyAccessToken(token);
      if (payload.role !== requiredRole) return next(new Error("Invalid socket role"));
      socket.data.user = { id: payload.sub, role: payload.role };
      return next();
    } catch {
      return next(new Error("Socket authentication failed"));
    }
  };
}
