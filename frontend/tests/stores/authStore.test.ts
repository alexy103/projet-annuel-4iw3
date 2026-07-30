import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { setActivePinia, createPinia } from "pinia";

const mockApiFetch = vi.fn();
mockNuxtImport("useApi", () => () => ({ apiFetch: mockApiFetch }));

const cookieStore: Record<string, ReturnType<typeof ref>> = {};
mockNuxtImport(
  "useCookie",
  () => (name: string, opts?: { default?: () => unknown }) => {
    if (!cookieStore[name]) cookieStore[name] = ref(opts?.default?.() ?? null);
    return cookieStore[name];
  }
);

describe("authStore – login", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockApiFetch.mockReset();
    Object.keys(cookieStore).forEach((k) => delete cookieStore[k]);
  });

  it("stocke les tokens et marque l'utilisateur authentifié", async () => {
    mockApiFetch.mockResolvedValue({
      userId: 1,
      roleId: 2,
      accessToken: "access-tok",
      refreshToken: "refresh-tok",
    });

    const store = useAuthStore();
    const result = await store.login("alice@example.com", "pass");

    expect(result.requiresTwoFactor).toBe(false);
    expect(store.isAuthenticated).toBe(true);
    expect(store.accessToken).toBe("access-tok");
  });

  it("retourne requiresTwoFactor=true et met l'état 2FA en attente", async () => {
    mockApiFetch.mockResolvedValue({
      requiresTwoFactor: true,
      pendingToken: "pending-jwt",
    });

    const store = useAuthStore();
    const result = await store.login("alice@example.com", "pass");

    expect(result.requiresTwoFactor).toBe(true);
    expect(store.isAuthenticated).toBe(false);
    expect(store.requiresTwoFactor).toBe(true);
  });

  it("propage l'erreur en cas d'échec API", async () => {
    mockApiFetch.mockRejectedValue(new Error("Invalid credentials"));

    const store = useAuthStore();
    await expect(store.login("alice@example.com", "wrong")).rejects.toThrow(
      "Invalid credentials"
    );
  });
});

describe("authStore – logout", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockApiFetch.mockReset();
    Object.keys(cookieStore).forEach((k) => delete cookieStore[k]);
  });

  it("appelle l'API logout et efface la session locale", async () => {
    mockApiFetch
      .mockResolvedValueOnce({
        userId: 1,
        roleId: 2,
        accessToken: "tok",
        refreshToken: "rtok",
      })
      .mockResolvedValueOnce(undefined);

    const store = useAuthStore();
    await store.login("alice@example.com", "pass");
    expect(store.isAuthenticated).toBe(true);

    await store.logout();

    expect(store.isAuthenticated).toBe(false);
    expect(store.accessToken).toBeNull();
  });

  it("efface la session même si l'API logout échoue", async () => {
    mockApiFetch
      .mockResolvedValueOnce({
        userId: 1,
        roleId: 2,
        accessToken: "tok",
        refreshToken: "rtok",
      })
      .mockRejectedValueOnce(new Error("Network error"));

    const store = useAuthStore();
    await store.login("alice@example.com", "pass");
    await store.logout();

    expect(store.isAuthenticated).toBe(false);
  });
});

describe("authStore – verifyTwoFactor", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockApiFetch.mockReset();
    Object.keys(cookieStore).forEach((k) => delete cookieStore[k]);
  });

  it("lève une erreur si aucune connexion 2FA n'est en attente", async () => {
    const store = useAuthStore();
    await expect(store.verifyTwoFactor("123456")).rejects.toThrow();
  });

  it("finalise la session après vérification du code 2FA", async () => {
    mockApiFetch.mockResolvedValueOnce({
      requiresTwoFactor: true,
      pendingToken: "pending-jwt",
    });
    const store = useAuthStore();
    await store.login("alice@example.com", "pass");

    mockApiFetch.mockResolvedValueOnce({
      userId: 1,
      roleId: 2,
      accessToken: "access-tok",
      refreshToken: "refresh-tok",
    });
    await store.verifyTwoFactor("123456");

    expect(store.isAuthenticated).toBe(true);
    expect(store.requiresTwoFactor).toBe(false);
    expect(store.accessToken).toBe("access-tok");
  });
});

describe("authStore – refreshAccessToken", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockApiFetch.mockReset();
    Object.keys(cookieStore).forEach((k) => delete cookieStore[k]);
  });

  it("retourne false si aucun refresh token n'est stocké", async () => {
    const store = useAuthStore();
    expect(await store.refreshAccessToken()).toBe(false);
  });

  it("met à jour les tokens et retourne true en cas de succès", async () => {
    mockApiFetch.mockResolvedValueOnce({
      userId: 1,
      roleId: 2,
      accessToken: "old-access",
      refreshToken: "old-refresh",
    });
    const store = useAuthStore();
    await store.login("alice@example.com", "pass");

    mockApiFetch.mockResolvedValueOnce({
      accessToken: "new-access",
      refreshToken: "new-refresh",
    });
    const result = await store.refreshAccessToken();

    expect(result).toBe(true);
    expect(store.accessToken).toBe("new-access");
  });

  it("efface la session et retourne false si le refresh échoue", async () => {
    mockApiFetch.mockResolvedValueOnce({
      userId: 1,
      roleId: 2,
      accessToken: "tok",
      refreshToken: "rtok",
    });
    const store = useAuthStore();
    await store.login("alice@example.com", "pass");

    mockApiFetch.mockRejectedValueOnce(new Error("Token expired"));
    const result = await store.refreshAccessToken();

    expect(result).toBe(false);
    expect(store.isAuthenticated).toBe(false);
  });
});

describe("authStore – register", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockApiFetch.mockReset();
  });

  it("appelle POST /auth/register avec les bons paramètres", async () => {
    mockApiFetch.mockResolvedValue({ id: 1, email: "alice@example.com" });
    const store = useAuthStore();

    await store.register({
      first_name: "Alice",
      last_name: "Dupont",
      email: "alice@example.com",
      password: "Password123!",
    });

    expect(mockApiFetch).toHaveBeenCalledWith(
      "/auth/register",
      expect.objectContaining({ method: "POST" })
    );
  });
});
