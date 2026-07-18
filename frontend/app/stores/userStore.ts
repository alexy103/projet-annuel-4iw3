type Animal = {
  id: number;
  name: string;
  image: string | undefined;
};

type ApiAnimal = {
  id: number;
  name: string;
  profile_picture_url?: string | null;
  profile_picture?: string | null;
  image?: string | null;
};

interface MeResponse {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  profile_picture?: string | null;
  onboarding_completed: boolean;
}

export const useUserStore = defineStore("user", () => {
  const isReady = ref(false);
  const id = ref<number | null>(null);
  const firstName = ref("John");
  const lastName = ref("Doe");
  const email = ref("");
  const avatar = ref<string | null>(null);
  const onboardingCompleted = ref(false);
  const notificationsPush = ref(true);
  const nightMode = ref(false);
  const twoFactorEnabled = ref(false);
  const animals = ref<Animal[]>([]);

  const isLoading = ref(false);
  const errorMessage = ref("");

  const fullName = computed(() => {
    return `${firstName.value} ${lastName.value}`;
  });

  const avatarUrl = computed(() => {
    if (!avatar.value) return null;
    if (avatar.value.startsWith("http")) return avatar.value;
    const config = useRuntimeConfig();
    const base = config.public.apiBase.replace(/\/api$/, "");
    return `${base}${avatar.value}`;
  });

  const updateProfile = async (data: { firstName?: string; lastName?: string; profilePictureFile?: File }) => {
    const { apiFetch } = useApi();
    const me = await apiFetch<MeResponse>("/users/me", {
      method: "PATCH",
      body: {
        first_name: data.firstName ?? firstName.value,
        last_name: data.lastName ?? lastName.value,
      },
    });
    firstName.value = me.first_name;
    lastName.value = me.last_name;

    if (data.profilePictureFile) {
      const formData = new FormData();
      formData.append("profile_picture", data.profilePictureFile);
      const updated = await apiFetch<MeResponse>(`/users/${me.id}/profile-picture`, {
        method: "PATCH",
        body: formData,
      });
      avatar.value = updated.profile_picture ?? null;
    }
  };

  const completeOnboarding = async (data?: { firstName?: string; lastName?: string; profilePictureFile?: File }) => {
    const { apiFetch } = useApi();
    const me = await apiFetch<MeResponse>("/users/me", {
      method: "PATCH",
      body: {
        first_name: data?.firstName ?? firstName.value,
        last_name: data?.lastName ?? lastName.value,
      },
    });

    firstName.value = me.first_name;
    lastName.value = me.last_name;
    onboardingCompleted.value = me.onboarding_completed;

    if (data?.profilePictureFile && me.id) {
      const formData = new FormData();
      formData.append("profile_picture", data.profilePictureFile);
      const updated = await apiFetch<MeResponse>(`/users/${me.id}/profile-picture`, {
        method: "PATCH",
        body: formData,
      });
      avatar.value = updated.profile_picture ?? null;
    }
  };

  const fetchMe = async () => {
    const { apiFetch } = useApi();
    const me = await apiFetch<MeResponse>("/users/me");

    id.value = me.id;
    firstName.value = me.first_name;
    lastName.value = me.last_name;
    email.value = me.email;
    avatar.value = me.profile_picture ?? null;
    onboardingCompleted.value = me.onboarding_completed;

    const authStore = useAuthStore();
    const status = await authStore.getTwoFactorStatus();
    twoFactorEnabled.value = status.enabled;
    isReady.value = true;
  };

  const fetchAnimals = async () => {
    if (!id.value) return;
    const { apiFetch } = useApi();
    const config = useRuntimeConfig();
    const baseUrl = config.public.apiBase.replace(/\/api$/, "");

    isLoading.value = true;
    try {
      const result = await apiFetch<ApiAnimal[]>(`/animals/user/${id.value}`);
      animals.value = result.map((animal: ApiAnimal) => {
        const path = animal.profile_picture || animal.profile_picture_url || animal.image || null;
        const image = path
          ? path.startsWith("http") ? path : `${baseUrl}${path}`
          : undefined;
        return { id: animal.id, name: animal.name, image };
      });
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : "Erreur lors du chargement des animaux";
    } finally {
      isLoading.value = false;
    }
  };

  const reset = () => {
    isReady.value = false;
    id.value = null;
    firstName.value = "John";
    lastName.value = "Doe";
    email.value = "";
    avatar.value = null;
    onboardingCompleted.value = false;
    twoFactorEnabled.value = false;
    animals.value = [];
  };

  return {
    isReady,
    id,
    firstName,
    lastName,
    email,
    avatar,
    onboardingCompleted,
    notificationsPush,
    nightMode,
    twoFactorEnabled,
    animals,
    isLoading,
    errorMessage,
    fullName,
    avatarUrl,
    updateProfile,
    completeOnboarding,
    fetchMe,
    fetchAnimals,
    reset,
  };
});
