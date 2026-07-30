import {
  hashPassword,
  verifyPassword,
  generateSecurePassword,
  isPasswordExpired,
} from "../../utils/password.utils";

describe("hashPassword", () => {
  it("retourne un hash bcrypt valide", async () => {
    const hash = await hashPassword("monmotdepasse");
    expect(hash).toMatch(/^\$2[aby]\$\d+\$/);
  });

  it("deux appels donnent des hashes différents (salt aléatoire)", async () => {
    const h1 = await hashPassword("monmotdepasse");
    const h2 = await hashPassword("monmotdepasse");
    expect(h1).not.toBe(h2);
  });
});

describe("verifyPassword", () => {
  it("valide le mot de passe correct", async () => {
    const hash = await hashPassword("correct");
    expect(await verifyPassword("correct", hash)).toBe(true);
  });

  it("rejette un mot de passe incorrect", async () => {
    const hash = await hashPassword("correct");
    expect(await verifyPassword("incorrect", hash)).toBe(false);
  });

  it("tient compte du pepper (hash d'une autre app != valide)", async () => {
    const bcrypt = require("bcrypt");
    const hashSansPepper = await bcrypt.hash("secret", 12);
    expect(await verifyPassword("secret", hashSansPepper)).toBe(false);
  });
});

describe("generateSecurePassword", () => {
  it("retourne un mot de passe de 16 caractères", () => {
    expect(generateSecurePassword()).toHaveLength(16);
  });

  it("utilise uniquement les caractères autorisés", () => {
    for (let i = 0; i < 20; i++) {
      expect(generateSecurePassword()).toMatch(/^[A-Za-z0-9!@#$%^&*]{16}$/);
    }
  });

  it("génère des mots de passe différents à chaque appel", () => {
    const passwords = new Set(Array.from({ length: 10 }, generateSecurePassword));
    expect(passwords.size).toBeGreaterThan(1);
  });
});

describe("isPasswordExpired", () => {
  it("retourne true pour une date passée", () => {
    expect(isPasswordExpired(new Date(Date.now() - 1000))).toBe(true);
  });

  it("retourne false pour une date future", () => {
    expect(isPasswordExpired(new Date(Date.now() + 60_000))).toBe(false);
  });
});
