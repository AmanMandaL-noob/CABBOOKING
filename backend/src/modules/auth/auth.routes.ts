import { Router } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { loginCustomer, loginDriver, registerCustomer, registerDriver } from "./auth.controller";

export const authRoutes = Router();

authRoutes.post("/customer/register", asyncHandler(registerCustomer));
authRoutes.post("/customer/login", asyncHandler(loginCustomer));
authRoutes.post("/driver/register", asyncHandler(registerDriver));
authRoutes.post("/driver/login", asyncHandler(loginDriver));
