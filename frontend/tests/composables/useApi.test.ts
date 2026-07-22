import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { setActivePinia, createPinia } from "pinia";

const mockFetch = vi.fn();

const mockRefreshAccessToken = vi.fn();
mockNuxtImport("useAuthStore", () => () => ({
  accessToken: null,
  refreshAccessToken: mockRefreshAccessToken,
}));

mockNuxtImport("useRuntimeConfig", () => () => ({
  app: { baseURL: "/" },
  public: { apiBase: "http://localhost:3003/api", apiKey: "test-key" },
}));

describe("useApi – apiFetch", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockFetch.mockReset();
    mockRefreshAccessToken.mockReset();
    vi.stubGlobal("$fetch", mockFetch);
  });

  it("ajoute le header x-api-key à chaque requête", async () => {
    mockFetch.mockResolvedValue({ success: true, data: { id: 1 } });
    const { apiFetch } = useApi();
    await apiFetch("/users/me");

    expect(mockFetch).toHaveBeenCalledWith(
      "/users/me",
      expect.objectContaining({
        headers: expect.objectContaining({ "x-api-key": "test-key" }),
      })
    );
  });

  it("déroule l'enveloppe { success, data } et retourne data", async () => {
    const payload = { id: 42, email: "alice@example.com" };
    mockFetch.mockResolvedValue({ success: true, data: payload });

    const { apiFetch } = useApi();
    const result = await apiFetch<typeof payload>("/users/me");

    expect(result).toEqual(payload);
  });

  it("passe la method et le body à $fetch", async () => {
    mockFetch.mockResolvedValue({ success: true, data: {} });
    const { apiFetch } = useApi();
    await apiFetch("/auth/login", {
      method: "POST",
      body: { email: "a@b.com", password: "pass" },
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "/auth/login",
      expect.objectContaining({
        method: "POST",
        body: { email: "a@b.com", password: "pass" },
      })
    );
  });

  it("lève une ApiError avec le message de l'API en cas d'erreur", async () => {
    mockFetch.mockRejectedValue({
      status: 401,
      data: { error: "Invalid credentials" },
    });

    const { apiFetch } = useApi();
    await expect(
      apiFetch("/auth/login", { method: "POST", body: {} })
    ).rejects.toMatchObject({
      message: "Invalid credentials",
      status: 401,
    });
  });

  it("utilise le message générique si l'API n'en fournit pas", async () => {
    mockFetch.mockRejectedValue({ status: 500 });

    const { apiFetch } = useApi();
    await expect(apiFetch("/users/me")).rejects.toMatchObject({
      status: 500,
    });
  });

  it("ne retry pas sur /auth/refresh pour éviter les boucles infinies", async () => {
    mockFetch.mockRejectedValue({ status: 401, data: { error: "Expired" } });

    const { apiFetch } = useApi();
    await expect(
      apiFetch("/auth/refresh", { method: "POST", body: {} })
    ).rejects.toBeDefined();

    expect(mockRefreshAccessToken).not.toHaveBeenCalled();
  });
});
