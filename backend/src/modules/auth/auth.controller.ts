import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { Customer } from "../customer/customer.model";
import { Driver } from "../driver/driver.model";
import { HttpError } from "../../utils/httpError";
import { signAccessToken } from "../../utils/tokens";
import { customerLoginSchema, customerRegisterSchema, driverLoginSchema, driverRegisterSchema } from "./auth.validation";

export async function registerCustomer(req: Request, res: Response) {
  const input = customerRegisterSchema.parse(req.body);
  const exists = await Customer.exists({ email: input.email });
  if (exists) throw new HttpError(409, "Email is already registered");

  const password = await bcrypt.hash(input.password, 12);
  const customer = await Customer.create({ ...input, password });
  const token = signAccessToken({ sub: customer._id.toString(), role: "customer" });

  return res.status(201).json({
    success: true,
    data: { id: customer._id, name: customer.name, role: "customer", token }
  });
}

export async function loginCustomer(req: Request, res: Response) {
  const input = customerLoginSchema.parse(req.body);
  const customer = await Customer.findOne({ email: input.email }).select("+password");
  if (!customer || !(await bcrypt.compare(input.password, customer.password))) {
    throw new HttpError(401, "Invalid email or password");
  }

  const token = signAccessToken({ sub: customer._id.toString(), role: "customer" });
  return res.json({ success: true, data: { id: customer._id, name: customer.name, role: "customer", token } });
}

export async function loginDriver(req: Request, res: Response) {
  const input = driverLoginSchema.parse(req.body);
  const driver = await Driver.findOne({ phone: input.phone }).select("+password");
  if (!driver || !(await bcrypt.compare(input.password, driver.password))) {
    throw new HttpError(401, "Invalid phone or password");
  }

  const token = signAccessToken({ sub: driver._id.toString(), role: "driver" });
  return res.json({ success: true, data: { id: driver._id, name: driver.name, role: "driver", token } });
}

export async function registerDriver(req: Request, res: Response) {
  const input = driverRegisterSchema.parse(req.body);
  const exists = await Driver.exists({ $or: [{ phone: input.phone }, { email: input.email }] });
  if (exists) throw new HttpError(409, "Driver with this phone or email already exists");

  const password = await bcrypt.hash(input.password, 12);
  const driver = await Driver.create({
    ...input,
    password,
    isOnline: false
  });
  const token = signAccessToken({ sub: driver._id.toString(), role: "driver" });

  return res.status(201).json({
    success: true,
    data: { id: driver._id, name: driver.name, role: "driver", token }
  });
}
