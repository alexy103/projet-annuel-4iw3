import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { setActivePinia, createPinia } from "pinia";

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockApiFetch = vi.fn();
mockNuxtImport("useApi", () => () => ({ apiFetch: mockApiFetch }));

mockNuxtImport("useAuthStore", () => () => ({
  getTwoFactorStatus: vi.fn().mockResolvedValue({ enabled: false }),
}));

mockNuxtImport("useRuntimeConfig", () => () => ({
  app: { baseURL: "/" },
  public: { apiBase: "http://localhost:3003/api", apiKey: "test-key" },
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

const meResponse = {
  id: 7,
  first_name: "Alice",
  last_name: "Dupont",
  email: "alice@example.com",
  profile_picture: "/uploads/users/alice.jpg",
  onboarding_completed: true,
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("userStore – fetchMe", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockApiFetch.mockReset();
  });

  it("hydrate le store avec les données utilisateur", async () => {
    mockApiFetch.mockResolvedValue(meResponse);
    const store = useUserStore();

    await store.fetchMe();

    expect(store.id).toBe(7);
    expect(store.firstName).toBe("Alice");
    expect(store.lastName).toBe("Dupont");
    expect(store.email).toBe("alice@example.com");
    expect(store.onboardingCompleted).toBe(true);
    expect(store.isReady).toBe(true);
  });

  it("stocke le chemin brut de la photo de profil", async () => {
    mockApiFetch.mockResolvedValue(meResponse);
    const store = useUserStore();
    await store.fetchMe();

    expect(store.avatar).toBe("/uploads/users/alice.jpg");
  });

  it("marque isReady=true même si profile_picture est null", async () => {
    mockApiFetch.mockResolvedValue({ ...meResponse, profile_picture: null });
    const store = useUserStore();
    await store.fetchMe();

    expect(store.isReady).toBe(true);
    expect(store.avatar).toBeNull();
  });
});

describe("userStore – avatarUrl", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockApiFetch.mockReset();
  });

  it("préfixe le baseUrl pour un chemin relatif", async () => {
    mockApiFetch.mockResolvedValue(meResponse);
    const store = useUserStore();
    await store.fetchMe();

    expect(store.avatarUrl).toBe("http://localhost:3003/uploads/users/alice.jpg");
  });

  it("retourne null si aucun avatar", async () => {
    mockApiFetch.mockResolvedValue({ ...meResponse, profile_picture: null });
    const store = useUserStore();
    await store.fetchMe();

    expect(store.avatarUrl).toBeNull();
  });

  it("retourne l'URL telle quelle si elle commence par http", async () => {
    mockApiFetch.mockResolvedValue({
      ...meResponse,
      profile_picture: "https://cdn.example.com/avatar.jpg",
    });
    const store = useUserStore();
    await store.fetchMe();

    expect(store.avatarUrl).toBe("https://cdn.example.com/avatar.jpg");
  });
});

describe("userStore – updateProfile", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockApiFetch.mockReset();
  });

  it("met à jour prénom et nom via PATCH /users/me", async () => {
    mockApiFetch.mockResolvedValue({
      ...meResponse,
      first_name: "Bob",
      last_name: "Martin",
    });

    const store = useUserStore();
    await store.updateProfile({ firstName: "Bob", lastName: "Martin" });

    expect(store.firstName).toBe("Bob");
    expect(store.lastName).toBe("Martin");
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/users/me",
      expect.objectContaining({ method: "PATCH" })
    );
  });

  it("upload la photo si un fichier est fourni", async () => {
    const updatedWithPicture = { ...meResponse, profile_picture: "/uploads/users/new.jpg" };
    mockApiFetch
      .mockResolvedValueOnce({ ...meResponse, id: 7 }) // PATCH /users/me
      .mockResolvedValueOnce(updatedWithPicture);      // PATCH /users/:id/profile-picture

    const store = useUserStore();
    const file = new File(["content"], "photo.jpg", { type: "image/jpeg" });
    await store.updateProfile({ firstName: "Alice", lastName: "Dupont", profilePictureFile: file });

    expect(mockApiFetch).toHaveBeenCalledTimes(2);
    expect(store.avatar).toBe("/uploads/users/new.jpg");
  });
});

describe("userStore – completeOnboarding", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockApiFetch.mockReset();
  });

  it("marque onboardingCompleted=true après l'appel API", async () => {
    mockApiFetch.mockResolvedValue({ ...meResponse, onboarding_completed: true });

    const store = useUserStore();
    await store.completeOnboarding({ firstName: "Alice", lastName: "Dupont" });

    expect(store.onboardingCompleted).toBe(true);
  });

  it("met à jour le prénom et nom fournis", async () => {
    mockApiFetch.mockResolvedValue({
      ...meResponse,
      first_name: "Camille",
      last_name: "Morin",
      onboarding_completed: true,
    });

    const store = useUserStore();
    await store.completeOnboarding({ firstName: "Camille", lastName: "Morin" });

    expect(store.firstName).toBe("Camille");
    expect(store.lastName).toBe("Morin");
  });
});

describe("userStore – fetchAnimals", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockApiFetch.mockReset();
  });

  it("ne fait rien si l'utilisateur n'a pas d'id", async () => {
    const store = useUserStore();
    await store.fetchAnimals();
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  it("charge et transforme la liste des animaux", async () => {
    mockApiFetch
      .mockResolvedValueOnce(meResponse) // fetchMe
      .mockResolvedValueOnce([
        { id: 1, name: "Rex", profile_picture: "/uploads/animals/rex.jpg" },
        { id: 2, name: "Mimi", profile_picture: null },
      ]);

    const store = useUserStore();
    await store.fetchMe();
    await store.fetchAnimals();

    expect(store.animals).toHaveLength(2);
    expect(store.animals[0]?.name).toBe("Rex");
    expect(store.animals[0]?.image).toBe("http://localhost:3003/uploads/animals/rex.jpg");
    expect(store.animals[1]?.name).toBe("Mimi");
    expect(store.animals[1]?.image).toBeUndefined();
  });
});

describe("userStore – reset", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockApiFetch.mockReset();
  });

  it("remet toutes les valeurs à leur état initial", async () => {
    mockApiFetch.mockResolvedValue(meResponse);
    const store = useUserStore();
    await store.fetchMe();

    store.reset();

    expect(store.isReady).toBe(false);
    expect(store.id).toBeNull();
    expect(store.firstName).toBe("John");
    expect(store.lastName).toBe("Doe");
    expect(store.email).toBe("");
    expect(store.avatar).toBeNull();
    expect(store.onboardingCompleted).toBe(false);
    expect(store.twoFactorEnabled).toBe(false);
    expect(store.animals).toHaveLength(0);
  });
});
