import jwt, { SignOptions } from "jsonwebtoken";
import { UserRole } from "@cab/shared";
import { env } from "../config/env";

export interface JwtPayload {
  sub: string;
  role: UserRole;
}

export function signAccessToken(payload: JwtPayload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  } as SignOptions);
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
