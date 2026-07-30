import bcrypt from "bcrypt";
import { config } from "dotenv";
import { AppError } from "../types";

config({
  quiet: true,
});

const SALT_ROUNDS: number = 12;
const PEPPER: string | undefined = process.env.PEPPER_SECRET;

if (!PEPPER) {
  throw new AppError("Password hashing service not configured properly", 503);
}

function addPepper(password: string): string {
  return password + PEPPER;
}

export async function hashPassword(password: string): Promise<string> {
  const saltedPassword: string = addPepper(password);
  return bcrypt.hash(saltedPassword, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  const saltedPassword: string = addPepper(password);
  return bcrypt.compare(saltedPassword, hash);
}

export function generateSecurePassword(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password: string = "";
  for (let i: number = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export function isPasswordExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}