import crypto from "crypto";

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function isCodeExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

export function generateRecoveryCodes(count: number = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    codes.push(crypto.randomBytes(5).toString("hex"));
  }
  return codes;
}
