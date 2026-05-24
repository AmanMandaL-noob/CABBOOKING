import { NextFunction, Request, Response } from "express";
import { UserRole } from "@cab/shared";
import { HttpError } from "../utils/httpError";
import { verifyAccessToken } from "../utils/tokens";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        id: string;
        role: UserRole;
      };
    }
  }
}

export function requireAuth(role?: UserRole) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return next(new HttpError(401, "Missing bearer token"));
    }

    const payload = verifyAccessToken(header.slice(7));
    if (role && payload.role !== role) {
      return next(new HttpError(403, "Cross-role access is not allowed"));
    }

    req.auth = { id: payload.sub, role: payload.role };
    return next();
  };
}
