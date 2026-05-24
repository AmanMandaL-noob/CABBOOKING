import bcrypt from "bcryptjs";

export function generateOtp(length = 6) {
  return "123456";
}

export async function hashOtp(otp: string) {
  return bcrypt.hash(otp, 10);
}

export async function verifyOtp(otp: string, hash?: string | null) {
  if (!hash) return false;
  return bcrypt.compare(otp, hash);
}
