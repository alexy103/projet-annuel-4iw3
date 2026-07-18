interface LoginResult {
  userId: number;
  roleId: number;
  accessToken: string;
  refreshToken: string;
  sessionId?: number;
}

interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  clinic_id?: number;
}

interface RequiresTwoFactorResult {
  requiresTwoFactor: true;
  pendingToken: string;
}

type LoginResponse = LoginResult | RequiresTwoFactorResult;

function isTwoFactorChallenge(
  result: LoginResponse,
): result is RequiresTwoFactorResult {
  return (result as RequiresTwoFactorResult).requiresTwoFactor === true;
}

export const useAuthStore = defineStore("auth", () => {
  const accessToken = useCookie<string | null>("access_token", {
    default: () => null,
    sameSite: "lax",
  });
  const refreshTokenCookie = useCookie<string | null>("refresh_token", {
    default: () => null,
    sameSite: "lax",
  });
  const pendingToken = ref<string | null>(null);
  const requiresTwoFactor = ref(false);

  const isAuthenticated = computed(() => !!accessToken.value);

  function setSession(result: LoginResult) {
    accessToken.value = result.accessToken;
    refreshTokenCookie.value = result.refreshToken;
    pendingToken.value = null;
    requiresTwoFactor.value = false;
  }

  function clearSession() {
    accessToken.value = null;
    refreshTokenCookie.value = null;
    pendingToken.value = null;
    requiresTwoFactor.value = false;
  }

  async function login(email: string, password: string) {
    const { apiFetch } = useApi();
    const result = await apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
    });

    if (isTwoFactorChallenge(result)) {
      pendingToken.value = result.pendingToken;
      requiresTwoFactor.value = true;
      return { requiresTwoFactor: true as const };
    }

    setSession(result);
    return { requiresTwoFactor: false as const };
  }

  async function register(payload: RegisterPayload) {
    const { apiFetch } = useApi();
    await apiFetch<{ id: number; email: string }>("/auth/register", {
      method: "POST",
      body: payload,
    });
  }

  async function verifyEmailCode(email: string, code: string) {
    const { apiFetch } = useApi();
    await apiFetch("/auth/verify-code", {
      method: "POST",
      body: { email, code: Number(code) },
    });
  }

  async function resendVerificationCode(email: string) {
    const { apiFetch } = useApi();
    await apiFetch("/auth/resend-code", { method: "POST", body: { email } });
  }

  async function loginWithGithub(code: string) {
    const { apiFetch } = useApi();
    const result = await apiFetch<LoginResponse>("/auth/oauth/github", {
      method: "POST",
      body: { code },
    });

    if (isTwoFactorChallenge(result)) {
      pendingToken.value = result.pendingToken;
      requiresTwoFactor.value = true;
      return { requiresTwoFactor: true as const };
    }

    setSession(result);
    return { requiresTwoFactor: false as const };
  }

  async function verifyTwoFactor(code: string) {
    if (!pendingToken.value) {
      throw new Error("Aucune connexion en attente de vérification");
    }

    const { apiFetch } = useApi();
    const result = await apiFetch<LoginResult>("/auth/2fa/verify", {
      method: "POST",
      body: { pending_token: pendingToken.value, code },
    });

    setSession(result);
  }

  async function refreshAccessToken(): Promise<boolean> {
    if (!refreshTokenCookie.value) return false;

    try {
      const { apiFetch } = useApi();
      const result = await apiFetch<{
        accessToken: string;
        refreshToken: string;
      }>("/auth/refresh", {
        method: "POST",
        body: { refresh_token: refreshTokenCookie.value },
      });

      accessToken.value = result.accessToken;
      refreshTokenCookie.value = result.refreshToken;
      return true;
    } catch {
      clearSession();
      return false;
    }
  }

  async function logout() {
    if (accessToken.value) {
      const { apiFetch } = useApi();
      try {
        await apiFetch("/auth/logout", { method: "POST" });
      } catch {
        // Best-effort: clear the local session even if the API call fails.
      }
    }
    clearSession();
  }

  async function setupTwoFactor() {
    const { apiFetch } = useApi();
    return apiFetch<{ secret: string; otpauthUrl: string }>(
      "/auth/2fa/setup",
      { method: "POST" },
    );
  }

  async function enableTwoFactor(code: string) {
    const { apiFetch } = useApi();
    return apiFetch<{ recoveryCodes: string[] }>("/auth/2fa/enable", {
      method: "POST",
      body: { code },
    });
  }

  async function disableTwoFactor(code: string) {
    const { apiFetch } = useApi();
    await apiFetch("/auth/2fa/disable", { method: "POST", body: { code } });
  }

  async function getTwoFactorStatus() {
    const { apiFetch } = useApi();
    return apiFetch<{ enabled: boolean }>("/auth/2fa/status");
  }

  return {
    accessToken,
    isAuthenticated,
    requiresTwoFactor,
    login,
    register,
    verifyEmailCode,
    resendVerificationCode,
    loginWithGithub,
    verifyTwoFactor,
    refreshAccessToken,
    logout,
    setupTwoFactor,
    enableTwoFactor,
    disableTwoFactor,
    getTwoFactorStatus,
  };
});
