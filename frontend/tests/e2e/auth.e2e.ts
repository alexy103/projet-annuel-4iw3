import { test, expect, type Page } from "@playwright/test";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const API = "http://localhost:3003/api";

/** Wraps data in the standard backend response envelope. */
function ok(data: unknown) {
  return JSON.stringify({ success: true, data });
}

const MOCK_USER = {
  id: 1,
  first_name: "Alice",
  last_name: "Dupont",
  email: "alice@example.com",
  profile_picture: null,
  onboarding_completed: true,
  role_id: 2,
};

const MOCK_SESSION = {
  userId: 1,
  roleId: 2,
  accessToken: "test-access-token",
  refreshToken: "test-refresh-token",
};

/** Intercepts all endpoints that the dashboard (index) page loads on mount. */
async function mockDashboardEndpoints(page: Page) {
  await page.route(`${API}/users/me`, (route) =>
    route.fulfill({ contentType: "application/json", body: ok(MOCK_USER) }),
  );
  await page.route(`${API}/auth/2fa/status`, (route) =>
    route.fulfill({
      contentType: "application/json",
      body: ok({ enabled: false }),
    }),
  );
  await page.route(`${API}/animals/user/**`, (route) =>
    route.fulfill({ contentType: "application/json", body: ok([]) }),
  );
  await page.route(`${API}/appointments`, (route) =>
    route.fulfill({ contentType: "application/json", body: ok([]) }),
  );
  await page.route(`${API}/clinics`, (route) =>
    route.fulfill({ contentType: "application/json", body: ok([]) }),
  );
  await page.route(`${API}/appointment-reasons`, (route) =>
    route.fulfill({ contentType: "application/json", body: ok([]) }),
  );
}

/** Intercepts all endpoints that the profile page loads on mount. */
async function mockProfileEndpoints(page: Page) {
  await page.route(`${API}/auth/2fa/status`, (route) =>
    route.fulfill({
      contentType: "application/json",
      body: ok({ enabled: false }),
    }),
  );
  await page.route(`${API}/treatment-types`, (route) =>
    route.fulfill({ contentType: "application/json", body: ok([]) }),
  );
}

// ─── Login ───────────────────────────────────────────────────────────────────

test.describe("Login flow", () => {
  test("successful login redirects to the dashboard", async ({ page }) => {
    await mockDashboardEndpoints(page);
    await page.route(`${API}/auth/login`, (route) =>
      route.fulfill({ contentType: "application/json", body: ok(MOCK_SESSION) }),
    );

    await page.goto("/login");
    await page.getByLabel("Adresse e-mail").fill("alice@example.com");
    await page.getByLabel("Mot de passe").fill("Password123!");
    await page.getByRole("button", { name: "Connexion" }).click();

    await page.waitForURL("/");
    await expect(page).toHaveURL("/");
  });

  test("displays an error message on wrong credentials", async ({ page }) => {
    await page.route(`${API}/auth/login`, (route) =>
      route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ success: false, error: "Email ou mot de passe incorrect" }),
      }),
    );

    await page.goto("/login");
    await page.getByLabel("Adresse e-mail").fill("alice@example.com");
    await page.getByLabel("Mot de passe").fill("wrong-password");
    await page.getByRole("button", { name: "Connexion" }).click();

    await expect(page.getByText("Email ou mot de passe incorrect")).toBeVisible();
    await expect(page).toHaveURL("/login");
  });

  test("shows the 2FA popup when the server returns a two-factor challenge", async ({
    page,
  }) => {
    await page.route(`${API}/auth/login`, (route) =>
      route.fulfill({
        contentType: "application/json",
        body: ok({ requiresTwoFactor: true, pendingToken: "pending-jwt" }),
      }),
    );

    await page.goto("/login");
    await page.getByLabel("Adresse e-mail").fill("alice@example.com");
    await page.getByLabel("Mot de passe").fill("Password123!");
    await page.getByRole("button", { name: "Connexion" }).click();

    await expect(page.getByText("Vérification en deux étapes")).toBeVisible();
    await expect(page).toHaveURL("/login");
  });

  test("completes login after entering the correct 2FA code", async ({ page }) => {
    await mockDashboardEndpoints(page);
    await page.route(`${API}/auth/login`, (route) =>
      route.fulfill({
        contentType: "application/json",
        body: ok({ requiresTwoFactor: true, pendingToken: "pending-jwt" }),
      }),
    );
    await page.route(`${API}/auth/2fa/verify`, (route) =>
      route.fulfill({ contentType: "application/json", body: ok(MOCK_SESSION) }),
    );

    await page.goto("/login");
    await page.getByLabel("Adresse e-mail").fill("alice@example.com");
    await page.getByLabel("Mot de passe").fill("Password123!");
    await page.getByRole("button", { name: "Connexion" }).click();

    await expect(page.getByText("Vérification en deux étapes")).toBeVisible();
    await page.getByLabel("Code").fill("123456");
    await page.getByRole("button", { name: "Valider" }).click();

    await page.waitForURL("/");
    await expect(page).toHaveURL("/");
  });

  test("shows an error when the 2FA code is wrong", async ({ page }) => {
    await page.route(`${API}/auth/login`, (route) =>
      route.fulfill({
        contentType: "application/json",
        body: ok({ requiresTwoFactor: true, pendingToken: "pending-jwt" }),
      }),
    );
    await page.route(`${API}/auth/2fa/verify`, (route) =>
      route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ success: false, error: "Code invalide ou expiré" }),
      }),
    );

    await page.goto("/login");
    await page.getByLabel("Adresse e-mail").fill("alice@example.com");
    await page.getByLabel("Mot de passe").fill("Password123!");
    await page.getByRole("button", { name: "Connexion" }).click();

    await expect(page.getByText("Vérification en deux étapes")).toBeVisible();
    await page.getByLabel("Code").fill("000000");
    await page.getByRole("button", { name: "Valider" }).click();

    await expect(page.getByText("Code invalide ou expiré")).toBeVisible();
    await expect(page).toHaveURL("/login");
  });
});

// ─── Register ─────────────────────────────────────────────────────────────────

test.describe("Register flow", () => {
  test("shows an error immediately when passwords do not match", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Prénom").fill("Alice");
    await page.getByLabel("Nom").fill("Dupont");
    await page.getByLabel("Adresse e-mail").fill("alice@example.com");
    await page.getByLabel("Mot de passe").fill("Password123!");
    await page.getByLabel("Confirmer le mot de passe").fill("DifferentPass!");
    await page.getByRole("button", { name: "Créer mon compte" }).click();

    await expect(page.getByText("Les mots de passe ne correspondent pas")).toBeVisible();
    await expect(page).toHaveURL("/register");
  });

  test("opens the email verification popup after successful registration", async ({
    page,
  }) => {
    await page.route(`${API}/auth/register`, (route) =>
      route.fulfill({
        contentType: "application/json",
        body: ok({ id: 1, email: "alice@example.com" }),
      }),
    );

    await page.goto("/register");
    await page.getByLabel("Prénom").fill("Alice");
    await page.getByLabel("Nom").fill("Dupont");
    await page.getByLabel("Adresse e-mail").fill("alice@example.com");
    await page.getByLabel("Mot de passe").fill("Password123!");
    await page.getByLabel("Confirmer le mot de passe").fill("Password123!");
    await page.getByRole("button", { name: "Créer mon compte" }).click();

    await expect(page.getByText("Vérifiez votre e-mail")).toBeVisible();
    await expect(page).toHaveURL("/register");
  });

  test("redirects to dashboard after register → email verification → login", async ({
    page,
  }) => {
    await mockDashboardEndpoints(page);
    await page.route(`${API}/auth/register`, (route) =>
      route.fulfill({
        contentType: "application/json",
        body: ok({ id: 1, email: "alice@example.com" }),
      }),
    );
    await page.route(`${API}/auth/verify-code`, (route) =>
      route.fulfill({ contentType: "application/json", body: ok(null) }),
    );
    await page.route(`${API}/auth/login`, (route) =>
      route.fulfill({ contentType: "application/json", body: ok(MOCK_SESSION) }),
    );

    await page.goto("/register");
    await page.getByLabel("Prénom").fill("Alice");
    await page.getByLabel("Nom").fill("Dupont");
    await page.getByLabel("Adresse e-mail").fill("alice@example.com");
    await page.getByLabel("Mot de passe").fill("Password123!");
    await page.getByLabel("Confirmer le mot de passe").fill("Password123!");
    await page.getByRole("button", { name: "Créer mon compte" }).click();

    await expect(page.getByText("Vérifiez votre e-mail")).toBeVisible();
    await page.getByLabel("Code de vérification").fill("123456");
    await page.getByRole("button", { name: "Valider" }).click();

    await page.waitForURL("/");
    await expect(page).toHaveURL("/");
  });

  test("shows an error when the email is already registered", async ({ page }) => {
    await page.route(`${API}/auth/register`, (route) =>
      route.fulfill({
        status: 409,
        contentType: "application/json",
        body: JSON.stringify({ success: false, error: "Email déjà utilisé" }),
      }),
    );

    await page.goto("/register");
    await page.getByLabel("Prénom").fill("Alice");
    await page.getByLabel("Nom").fill("Dupont");
    await page.getByLabel("Adresse e-mail").fill("existing@example.com");
    await page.getByLabel("Mot de passe").fill("Password123!");
    await page.getByLabel("Confirmer le mot de passe").fill("Password123!");
    await page.getByRole("button", { name: "Créer mon compte" }).click();

    await expect(page.getByText("Email déjà utilisé")).toBeVisible();
    await expect(page).toHaveURL("/register");
  });
});

// ─── Logout ──────────────────────────────────────────────────────────────────

test.describe("Logout flow", () => {
  test("redirects to /login after clicking Déconnexion on the profile page", async ({
    page,
  }) => {
    // Set up authenticated state via the login flow first
    await mockDashboardEndpoints(page);
    await mockProfileEndpoints(page);
    await page.route(`${API}/auth/login`, (route) =>
      route.fulfill({ contentType: "application/json", body: ok(MOCK_SESSION) }),
    );
    await page.route(`${API}/auth/logout`, (route) =>
      route.fulfill({ contentType: "application/json", body: ok(null) }),
    );

    // Login
    await page.goto("/login");
    await page.getByLabel("Adresse e-mail").fill("alice@example.com");
    await page.getByLabel("Mot de passe").fill("Password123!");
    await page.getByRole("button", { name: "Connexion" }).click();
    await page.waitForURL("/");

    // Navigate to profile page
    await page.goto(`/profile/${MOCK_USER.id}`);
    await page.getByRole("button", { name: "Déconnexion" }).click();

    await page.waitForURL("/login");
    await expect(page).toHaveURL("/login");
  });
});
