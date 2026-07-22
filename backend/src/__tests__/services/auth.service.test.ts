import jwt from "jsonwebtoken";
import { authenticator } from "otplib";
import { authService } from "../../services/auth.service";
import { AppError } from "../../types";

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
  clinicsRepository: {
    findById: jest.fn(),
  },
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

jest.mock("../../services/users.service", () => ({
  userService: { create: jest.fn() },
}));

jest.mock("../../utils/mail.utils", () => ({
  sendVerificationCodeEmail: jest.fn().mockResolvedValue(undefined),
  sendTempPasswordEmail: jest.fn().mockResolvedValue(undefined),
  sendFinalPasswordEmail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("otplib", () => ({
  authenticator: {
    verify: jest.fn(),
    generateSecret: jest.fn().mockReturnValue("TESTSECRET"),
    keyuri: jest.fn().mockReturnValue("otpauth://totp/test"),
  },
}));

const { usersRepository, sessionsRepository, users2FARepository, rolesRepository } =
  jest.requireMock("../../repositories") as {
    usersRepository: Record<string, jest.Mock>;
    sessionsRepository: Record<string, jest.Mock>;
    users2FARepository: Record<string, jest.Mock>;
    rolesRepository: Record<string, jest.Mock>;
  };
const { userService } = jest.requireMock("../../services/users.service") as {
  userService: Record<string, jest.Mock>;
};

type MockUser = {
  id: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  is_activated: boolean;
  email_verified: boolean;
  must_change_password: boolean;
  role_id: number;
  clinic_id: number | null;
  onboarding_completed: boolean;
  profile_picture: string | null;
  oauth_provider: string | null;
  oauth_id: string | null;
  email_verification_code: string | null;
  email_verification_expires_at: Date | null;
  password_temp_expires_at: Date | null;
};

type MockSession = {
  id: number;
  user_id: number;
  refresh_token_hash: string;
  user_agent: string | null;
  ip_address: string | null;
  created_at: Date;
};

const mockUser: MockUser = {
  id: 1,
  email: "alice@example.com",
  password_hash: "hashed",
  first_name: "Alice",
  last_name: "Dupont",
  is_activated: true,
  email_verified: true,
  must_change_password: false,
  role_id: 2,
  clinic_id: null,
  onboarding_completed: false,
  profile_picture: null,
  oauth_provider: null,
  oauth_id: null,
  email_verification_code: null,
  email_verification_expires_at: null,
  password_temp_expires_at: null,
};

const mockSession: MockSession = {
  id: 10,
  user_id: 1,
  refresh_token_hash: "refreshhash",
  user_agent: null,
  ip_address: null,
  created_at: new Date(),
};

describe("authService.login", () => {
  beforeEach(() => jest.clearAllMocks());

  it("crée une session pour des identifiants valides", async () => {
    usersRepository.findByEmail.mockResolvedValue(mockUser);
    sessionsRepository.create.mockResolvedValue(mockSession);
    users2FARepository.findByUserId.mockResolvedValue(null);

    jest
      .spyOn(require("../../utils/password.utils"), "verifyPassword")
      .mockResolvedValue(true);

    const result = await authService.login("alice@example.com", "password123");

    expect(result).toHaveProperty("accessToken");
    expect(result).toHaveProperty("refreshToken");
    expect(result).toHaveProperty("userId", 1);
  });

  it("lève une erreur si l'utilisateur est inconnu", async () => {
    usersRepository.findByEmail.mockResolvedValue(null);

    await expect(authService.login("unknown@example.com", "pass")).rejects.toThrow(
      AppError
    );
  });

  it("lève une erreur si le compte n'est pas activé", async () => {
    usersRepository.findByEmail.mockResolvedValue({ ...mockUser, is_activated: false });

    await expect(authService.login("alice@example.com", "pass")).rejects.toThrow(
      AppError
    );
  });

  it("lève une erreur si l'email n'est pas vérifié", async () => {
    usersRepository.findByEmail.mockResolvedValue({ ...mockUser, email_verified: false });

    await expect(authService.login("alice@example.com", "pass")).rejects.toThrow(
      AppError
    );
  });

  it("retourne requiresTwoFactor si la 2FA est activée", async () => {
    usersRepository.findByEmail.mockResolvedValue(mockUser);
    users2FARepository.findByUserId.mockResolvedValue({
      id: 5,
      user_id: 1,
      totp_secret: "SECRET",
      is_enabled: true,
      recovery_codes: [],
    });

    jest
      .spyOn(require("../../utils/password.utils"), "verifyPassword")
      .mockResolvedValue(true);

    const result = await authService.login("alice@example.com", "password123");

    expect(result).toHaveProperty("requiresTwoFactor", true);
    expect(result).toHaveProperty("pendingToken");
  });

  it("lève une erreur si le mot de passe est incorrect", async () => {
    usersRepository.findByEmail.mockResolvedValue(mockUser);
    jest
      .spyOn(require("../../utils/password.utils"), "verifyPassword")
      .mockResolvedValue(false);

    await expect(authService.login("alice@example.com", "wrong")).rejects.toThrow(
      AppError
    );
  });
});

describe("authService.verifyCode", () => {
  beforeEach(() => jest.clearAllMocks());

  it("valide un code correct non expiré", async () => {
    const future: Date = new Date(Date.now() + 600_000);
    usersRepository.findByEmail.mockResolvedValue({
      ...mockUser,
      email_verified: false,
      email_verification_code: "123456",
      email_verification_expires_at: future,
    });
    usersRepository.updateEmailVerified = jest.fn().mockResolvedValue({ ...mockUser, email_verified: true });

    const result = await authService.verifyCode("alice@example.com", "123456");
    expect(result).toHaveProperty("email_verified");
  });

  it("lève une erreur si l'utilisateur n'existe pas", async () => {
    usersRepository.findByEmail.mockResolvedValue(null);
    await expect(authService.verifyCode("unknown@example.com", "123456")).rejects.toThrow(AppError);
  });

  it("lève une erreur si l'email est déjà vérifié", async () => {
    usersRepository.findByEmail.mockResolvedValue({ ...mockUser, email_verified: true });
    await expect(authService.verifyCode("alice@example.com", "123456")).rejects.toThrow(AppError);
  });

  it("lève une erreur si le code est expiré", async () => {
    const past: Date = new Date(Date.now() - 1000);
    usersRepository.findByEmail.mockResolvedValue({
      ...mockUser,
      email_verified: false,
      email_verification_code: "123456",
      email_verification_expires_at: past,
    });
    await expect(authService.verifyCode("alice@example.com", "123456")).rejects.toThrow(AppError);
  });

  it("lève une erreur si le code est incorrect", async () => {
    const future: Date = new Date(Date.now() + 600_000);
    usersRepository.findByEmail.mockResolvedValue({
      ...mockUser,
      email_verified: false,
      email_verification_code: "123456",
      email_verification_expires_at: future,
    });
    await expect(authService.verifyCode("alice@example.com", "000000")).rejects.toThrow(AppError);
  });
});

describe("authService.enableTwoFactor", () => {
  beforeEach(() => jest.clearAllMocks());

  it("active la 2FA avec un code TOTP valide", async () => {
    users2FARepository.findByUserId.mockResolvedValue({
      id: 5,
      user_id: 1,
      totp_secret: "SECRET",
      is_enabled: false,
      recovery_codes: null,
    });
    (authenticator.verify as jest.Mock).mockReturnValue(true);
    users2FARepository.update.mockResolvedValue({});

    const result = await authService.enableTwoFactor(1, "123456");
    expect(result).toHaveProperty("recoveryCodes");
    expect(Array.isArray(result.recoveryCodes)).toBe(true);
    expect(result.recoveryCodes).toHaveLength(8);
  });

  it("lève une erreur si le code TOTP est invalide", async () => {
    users2FARepository.findByUserId.mockResolvedValue({
      id: 5,
      user_id: 1,
      totp_secret: "SECRET",
      is_enabled: false,
      recovery_codes: null,
    });
    (authenticator.verify as jest.Mock).mockReturnValue(false);

    await expect(authService.enableTwoFactor(1, "000000")).rejects.toThrow(AppError);
  });

  it("lève une erreur si la 2FA est déjà activée", async () => {
    users2FARepository.findByUserId.mockResolvedValue({
      id: 5,
      user_id: 1,
      totp_secret: "SECRET",
      is_enabled: true,
      recovery_codes: ["abc"],
    });

    await expect(authService.enableTwoFactor(1, "123456")).rejects.toThrow(AppError);
  });

  it("lève une erreur si le setup n'a pas été fait", async () => {
    users2FARepository.findByUserId.mockResolvedValue(null);

    await expect(authService.enableTwoFactor(1, "123456")).rejects.toThrow(AppError);
  });
});

describe("authService.disableTwoFactor", () => {
  beforeEach(() => jest.clearAllMocks());

  const mock2FA: {
    id: number;
    user_id: number;
    totp_secret: string;
    is_enabled: boolean;
    recovery_codes: string;
  } = {
    id: 5,
    user_id: 1,
    totp_secret: "SECRET",
    is_enabled: true,
    recovery_codes: JSON.stringify(["aabbcc1122", "ddeeff3344"]),
  };

  it("désactive la 2FA avec un code TOTP valide", async () => {
    users2FARepository.findByUserId.mockResolvedValue(mock2FA);
    (authenticator.verify as jest.Mock).mockReturnValue(true);
    users2FARepository.delete.mockResolvedValue(undefined);

    await expect(authService.disableTwoFactor(1, "123456")).resolves.toBeUndefined();
    expect(users2FARepository.delete).toHaveBeenCalledWith(5);
  });

  it("désactive la 2FA avec un code de récupération valide", async () => {
    users2FARepository.findByUserId.mockResolvedValue(mock2FA);
    (authenticator.verify as jest.Mock).mockReturnValue(false);
    users2FARepository.delete.mockResolvedValue(undefined);

    await expect(authService.disableTwoFactor(1, "aabbcc1122")).resolves.toBeUndefined();
  });

  it("lève une erreur si le code est invalide", async () => {
    users2FARepository.findByUserId.mockResolvedValue(mock2FA);
    (authenticator.verify as jest.Mock).mockReturnValue(false);

    await expect(authService.disableTwoFactor(1, "wrongcode")).rejects.toThrow(AppError);
  });

  it("lève une erreur si la 2FA n'est pas activée", async () => {
    users2FARepository.findByUserId.mockResolvedValue(null);

    await expect(authService.disableTwoFactor(1, "123456")).rejects.toThrow(AppError);
  });
});

describe("authService.getTwoFactorStatus", () => {
  beforeEach(() => jest.clearAllMocks());

  it("retourne enabled: true si la 2FA est activée", async () => {
    users2FARepository.findByUserId.mockResolvedValue({ is_enabled: true });
    expect(await authService.getTwoFactorStatus(1)).toEqual({ enabled: true });
  });

  it("retourne enabled: false si la 2FA est désactivée", async () => {
    users2FARepository.findByUserId.mockResolvedValue({ is_enabled: false });
    expect(await authService.getTwoFactorStatus(1)).toEqual({ enabled: false });
  });

  it("retourne enabled: false si aucun enregistrement 2FA", async () => {
    users2FARepository.findByUserId.mockResolvedValue(null);
    expect(await authService.getTwoFactorStatus(1)).toEqual({ enabled: false });
  });
});

describe("authService.logout", () => {
  beforeEach(() => jest.clearAllMocks());

  it("supprime les sessions de l'utilisateur", async () => {
    sessionsRepository.deleteUserSessions.mockResolvedValue(undefined);
    await authService.logout(1);
    expect(sessionsRepository.deleteUserSessions).toHaveBeenCalledWith(1);
  });

  it("lève une erreur si userId est 0", async () => {
    await expect(authService.logout(0)).rejects.toThrow(AppError);
  });
});

describe("authService.createPendingTwoFactorToken", () => {
  it("crée un JWT avec le purpose '2fa'", () => {
    const token: string = authService.createPendingTwoFactorToken(42);
    const decoded: Record<string, unknown> = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as Record<string, unknown>;
    expect(decoded.userId).toBe(42);
    expect(decoded.purpose).toBe("2fa");
  });
});
