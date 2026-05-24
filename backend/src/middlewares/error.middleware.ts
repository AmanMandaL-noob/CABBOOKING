import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/httpError";

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ success: false, message: "Validation failed", errors: err.flatten() });
  }

  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ success: false, message: err.message, details: err.details });
  }

  if (err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }

  console.error(err);
  return res.status(500).json({ success: false, message: "Internal server error" });
};
