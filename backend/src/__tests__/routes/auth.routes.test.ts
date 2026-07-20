import request from "supertest";
import jwt from "jsonwebtoken";

// Mock du module DB avant tout import de l'app
jest.mock("../../config/db", () => ({
  db: { query: jest.fn() },
}));

jest.mock("../../repositories", () => ({
  usersRepository: {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    findByOAuthId: jest.fn(),
    createOAuthUser: jest.fn(),
    updateCodeVerification: jest.fn(),
    updateEmailVerified: jest.fn(),
    updatePassword: jest.fn(),
    resetPassword: jest.fn(),
  },
  rolesRepository: {
    findByLabel: jest.fn(),
    findById: jest.fn(),
  },
  clinicsRepository: { findById: jest.fn() },
  sessionsRepository: {
    create: jest.fn(),
    findByUser: jest.fn(),
    deleteUserSessions: jest.fn(),
    update: jest.fn(),
  },
  users2FARepository: {
    findByUserId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("../../services/auth.service", () => ({
  authService: {
    register: jest.fn(),
    login: jest.fn(),
    verifyCode: jest.fn(),
    resendCode: jest.fn(),
    logout: jest.fn(),
    refreshToken: jest.fn(),
    getTwoFactorStatus: jest.fn(),
    setupTwoFactor: jest.fn(),
    enableTwoFactor: jest.fn(),
    disableTwoFactor: jest.fn(),
    verifyTwoFactorLogin: jest.fn(),
    githubOAuth: jest.fn(),
    changePassword: jest.fn(),
    resetPassword: jest.fn(),
  },
}));

jest.mock("../../services/users.service", () => ({
  userService: { create: jest.fn() },
}));

jest.mock("nodemailer", () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: "test" }),
  }),
}));

import { app } from "../../app";

const { authService } = jest.requireMock("../../services/auth.service");
const { sessionsRepository, usersRepository, rolesRepository } =
  jest.requireMock("../../repositories");

const API_KEY = "test-api-key";

// Helper : génère un token JWT valide pour les tests des routes protégées
function makeAuthToken(userId = 1) {
  return jwt.sign({ userId }, process.env.JWT_SECRET!);
}

// Helper : configure les mocks de l'auth middleware pour un utilisateur donné
function setupAuthMiddlewareMocks(userId = 1, roleLabel = "user") {
  sessionsRepository.findByUser.mockResolvedValue([{ id: 10 }]);
  usersRepository.findById.mockResolvedValue({
    id: userId,
    email: "alice@example.com",
    role_id: 2,
    is_activated: true,
    clinic_id: null,
  });
  rolesRepository.findById.mockResolvedValue({ id: 2, label: roleLabel });
}

beforeEach(() => jest.clearAllMocks());

// ─── Middleware API Key ──────────────────────────────────────────────────────

describe("Middleware requireApiKey", () => {
  it("retourne 401 sans clé API", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect(res.status).toBe(401);
  });

  it("retourne 401 avec une clé API invalide", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("x-api-key", "wrong-key")
      .send({});
    expect(res.status).toBe(401);
  });
});

// ─── POST /api/auth/register ─────────────────────────────────────────────────

describe("POST /api/auth/register", () => {
  it("retourne 400 si des champs obligatoires sont manquants", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .set("x-api-key", API_KEY)
      .send({ email: "test@test.com" }); // manque first_name, last_name, password
    expect(res.status).toBe(400);
  });

  it("retourne 201 et appelle authService.register", async () => {
    authService.register.mockResolvedValue({ id: 1, email: "alice@example.com" });

    const res = await request(app)
      .post("/api/auth/register")
      .set("x-api-key", API_KEY)
      .send({
        first_name: "Alice",
        last_name: "Dupont",
        email: "alice@example.com",
        password: "Password123!",
      });

    expect(res.status).toBe(200);
    expect(authService.register).toHaveBeenCalledTimes(1);
    expect(res.body).toHaveProperty("success", true);
  });

  it("propage les erreurs métier (ex: email déjà pris)", async () => {
    const { AppError } = await import("../../types");
    authService.register.mockRejectedValue(new AppError("Email already exists", 409));

    const res = await request(app)
      .post("/api/auth/register")
      .set("x-api-key", API_KEY)
      .send({
        first_name: "Alice",
        last_name: "Dupont",
        email: "alice@example.com",
        password: "Password123!",
      });

    expect(res.status).toBe(409);
  });
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

describe("POST /api/auth/login", () => {
  it("retourne 400 si email/password sont absents", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("x-api-key", API_KEY)
      .send({});
    expect(res.status).toBe(400);
  });

  it("retourne 200 avec les tokens sur connexion réussie", async () => {
    authService.login.mockResolvedValue({
      userId: 1,
      roleId: 2,
      accessToken: "access.token",
      refreshToken: "refresh.token",
      sessionId: 10,
    });

    const res = await request(app)
      .post("/api/auth/login")
      .set("x-api-key", API_KEY)
      .send({ email: "alice@example.com", password: "pass123" });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("accessToken");
    expect(res.body.data).toHaveProperty("refreshToken");
  });

  it("retourne 200 avec requiresTwoFactor si la 2FA est activée", async () => {
    authService.login.mockResolvedValue({
      requiresTwoFactor: true,
      pendingToken: "pending.jwt",
    });

    const res = await request(app)
      .post("/api/auth/login")
      .set("x-api-key", API_KEY)
      .send({ email: "alice@example.com", password: "pass123" });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("requiresTwoFactor", true);
    expect(res.body.data).toHaveProperty("pendingToken");
  });

  it("retourne 401 sur mauvais identifiants", async () => {
    const { AppError } = await import("../../types");
    authService.login.mockRejectedValue(new AppError("Invalid user or password", 401));

    const res = await request(app)
      .post("/api/auth/login")
      .set("x-api-key", API_KEY)
      .send({ email: "alice@example.com", password: "wrong" });

    expect(res.status).toBe(401);
  });
});

// ─── POST /api/auth/verify-code ───────────────────────────────────────────────

describe("POST /api/auth/verify-code", () => {
  it("retourne 400 si le corps est invalide", async () => {
    const res = await request(app)
      .post("/api/auth/verify-code")
      .set("x-api-key", API_KEY)
      .send({ email: "alice@example.com" }); // manque le code
    expect(res.status).toBe(400);
  });

  it("retourne 200 sur vérification réussie", async () => {
    authService.verifyCode.mockResolvedValue({ id: 1, email_verified: true });

    const res = await request(app)
      .post("/api/auth/verify-code")
      .set("x-api-key", API_KEY)
      .send({ email: "alice@example.com", code: "123456" });

    expect(res.status).toBe(200);
    expect(authService.verifyCode).toHaveBeenCalledWith("alice@example.com", "123456");
  });
});

// ─── Routes protégées (requireAuth) ──────────────────────────────────────────

describe("GET /api/auth/2fa/status", () => {
  it("retourne 401 sans token Bearer", async () => {
    const res = await request(app)
      .get("/api/auth/2fa/status")
      .set("x-api-key", API_KEY);
    expect(res.status).toBe(401);
  });

  it("retourne 200 avec le statut 2FA pour un utilisateur authentifié", async () => {
    setupAuthMiddlewareMocks();
    authService.getTwoFactorStatus.mockResolvedValue({ enabled: false });

    const res = await request(app)
      .get("/api/auth/2fa/status")
      .set("x-api-key", API_KEY)
      .set("Authorization", `Bearer ${makeAuthToken(1)}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("enabled");
  });
});

describe("POST /api/auth/logout", () => {
  it("retourne 401 sans token", async () => {
    const res = await request(app)
      .post("/api/auth/logout")
      .set("x-api-key", API_KEY);
    expect(res.status).toBe(401);
  });

  it("retourne 200 et supprime la session", async () => {
    setupAuthMiddlewareMocks();
    authService.logout.mockResolvedValue(undefined);

    const res = await request(app)
      .post("/api/auth/logout")
      .set("x-api-key", API_KEY)
      .set("Authorization", `Bearer ${makeAuthToken(1)}`);

    expect(res.status).toBe(200);
    expect(authService.logout).toHaveBeenCalledWith(1);
  });
});
