import { generateVerificationCode, isCodeExpired, generateRecoveryCodes } from "../../utils/code.utils";

describe("generateVerificationCode", () => {
  it("retourne un code à 6 chiffres", () => {
    const code = generateVerificationCode();
    expect(code).toMatch(/^\d{6}$/);
  });

  it("génère un code dans la plage 100000-999999", () => {
    for (let i = 0; i < 50; i++) {
      const n = parseInt(generateVerificationCode(), 10);
      expect(n).toBeGreaterThanOrEqual(100000);
      expect(n).toBeLessThanOrEqual(999999);
    }
  });
});

describe("isCodeExpired", () => {
  it("retourne true pour une date passée", () => {
    expect(isCodeExpired(new Date(Date.now() - 1000))).toBe(true);
  });

  it("retourne false pour une date future", () => {
    expect(isCodeExpired(new Date(Date.now() + 60_000))).toBe(false);
  });

  it("retourne true pour la date exacte du moment (expiré)", () => {
    const now = new Date(Date.now() - 1);
    expect(isCodeExpired(now)).toBe(true);
  });
});

describe("generateRecoveryCodes", () => {
  it("génère 8 codes par défaut", () => {
    expect(generateRecoveryCodes()).toHaveLength(8);
  });

  it("respecte le paramètre count", () => {
    expect(generateRecoveryCodes(5)).toHaveLength(5);
    expect(generateRecoveryCodes(12)).toHaveLength(12);
  });

  it("chaque code est une chaîne hexadécimale de 10 caractères", () => {
    for (const code of generateRecoveryCodes()) {
      expect(code).toMatch(/^[0-9a-f]{10}$/);
    }
  });

  it("les codes sont uniques", () => {
    const codes = generateRecoveryCodes(8);
    expect(new Set(codes).size).toBe(8);
  });
});
